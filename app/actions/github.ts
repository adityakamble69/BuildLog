"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { recordActivity } from "@/app/actions/activity";
import type { ActionResult } from "@/app/actions/projects";
import { requireUserId } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { devLogs } from "@/lib/db/schema/dev-logs";
import { githubCommitImports } from "@/lib/db/schema/github-commit-imports";
import { projects } from "@/lib/db/schema/projects";
import {
  getAuthorizedRepository,
  getGitHubAccessToken,
  getSafeGitHubConnection,
  GitHubServiceError,
  listGitHubCommits,
  listGitHubRepositories as fetchGitHubRepositories,
  type GitHubRepository,
  type SafeGitHubConnection,
} from "@/lib/github/service";
import {
  githubProjectIdSchema,
  linkGitHubRepositorySchema,
} from "@/lib/validations/github";

/** Safe GitHub account data for the Settings page; it never contains a token. */
export async function getGitHubConnection(): Promise<SafeGitHubConnection | null> {
  const userId = await requireUserId();
  return getSafeGitHubConnection(userId);
}

/** Lists only repositories GitHub has authorized for the current user. */
export async function listGitHubRepositories(): Promise<
  ActionResult<GitHubRepository[]>
> {
  const userId = await requireUserId();

  try {
    const accessToken = await getGitHubAccessToken(userId);
    return { success: true, data: await fetchGitHubRepositories(accessToken) };
  } catch (error) {
    return { success: false, error: githubErrorMessage(error) };
  }
}

/**
 * Links a repository only after verifying the project owner and verifying the
 * selected repository against the current user's GitHub access token.
 */
export async function linkGitHubRepository(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = linkGitHubRepositorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Choose a valid GitHub repository." };
  }

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, parsed.data.projectId),
        eq(projects.userId, userId)
      )
    )
    .limit(1);

  if (!project) return { success: false, error: "Project not found." };

  try {
    const accessToken = await getGitHubAccessToken(userId);
    const repository = await getAuthorizedRepository(
      accessToken,
      parsed.data.repositoryId
    );
    if (!repository) {
      return {
        success: false,
        error: "That repository is not available through your GitHub connection.",
      };
    }

    await db
      .update(projects)
      .set({
        githubRepositoryId: repository.id,
        githubRepositoryOwner: repository.owner,
        githubRepositoryName: repository.name,
        githubRepositoryUrl: repository.htmlUrl,
        githubDefaultBranch: repository.defaultBranch,
        githubLastSyncedAt: null,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, project.id), eq(projects.userId, userId)));

    await recordActivity(project.id, userId, "github_repository_linked", {
      repository: repository.fullName,
    });

    revalidateProject(project.id);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: githubErrorMessage(error) };
  }
}

export async function unlinkGitHubRepository(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = githubProjectIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid project." };

  const [project] = await db
    .update(projects)
    .set({
      githubRepositoryId: null,
      githubRepositoryOwner: null,
      githubRepositoryName: null,
      githubRepositoryUrl: null,
      githubDefaultBranch: null,
      githubLastSyncedAt: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(projects.id, parsed.data.projectId),
        eq(projects.userId, userId)
      )
    )
    .returning({ id: projects.id });

  if (!project) return { success: false, error: "Project not found." };

  await recordActivity(project.id, userId, "github_repository_unlinked");
  revalidateProject(project.id);
  return { success: true, data: undefined };
}

/**
 * Imports the most recent 30 commits. A database uniqueness constraint on
 * (project_id, sha) makes every manual sync safe to repeat.
 */
export async function syncGitHubCommits(
  input: unknown
): Promise<ActionResult<{ importedCount: number }>> {
  const userId = await requireUserId();
  const parsed = githubProjectIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid project." };

  const [project] = await db
    .select({
      id: projects.id,
      githubRepositoryId: projects.githubRepositoryId,
      githubRepositoryOwner: projects.githubRepositoryOwner,
      githubRepositoryName: projects.githubRepositoryName,
    })
    .from(projects)
    .where(
      and(
        eq(projects.id, parsed.data.projectId),
        eq(projects.userId, userId)
      )
    )
    .limit(1);

  if (!project) return { success: false, error: "Project not found." };
  if (
    !project.githubRepositoryId ||
    !project.githubRepositoryOwner ||
    !project.githubRepositoryName
  ) {
    return { success: false, error: "Link a GitHub repository before syncing." };
  }

  try {
    const accessToken = await getGitHubAccessToken(userId);
    const commits = await listGitHubCommits(
      accessToken,
      project.githubRepositoryOwner,
      project.githubRepositoryName
    );

    const importedCount = await db.transaction(async (tx) => {
      let count = 0;

      for (const commit of commits) {
        const [importedCommit] = await tx
          .insert(githubCommitImports)
          .values({
            projectId: project.id,
            userId,
            repositoryId: project.githubRepositoryId!,
            sha: commit.sha,
            message: commit.message,
            htmlUrl: commit.htmlUrl,
            authorLogin: commit.authorLogin,
            authorName: commit.authorName,
            committedAt: commit.committedAt,
          })
          .onConflictDoNothing()
          .returning({ id: githubCommitImports.id });

        if (!importedCommit) continue;

        await tx.insert(devLogs).values({
          projectId: project.id,
          userId,
          content: formatCommitAsDevLog(commit),
          createdAt: commit.committedAt,
          updatedAt: commit.committedAt,
        });
        count += 1;
      }

      await tx
        .update(projects)
        .set({ githubLastSyncedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(projects.id, project.id), eq(projects.userId, userId)));

      return count;
    });

    await recordActivity(project.id, userId, "github_commits_synced", {
      repository: `${project.githubRepositoryOwner}/${project.githubRepositoryName}`,
      importedCount,
    });

    revalidateProject(project.id);
    return { success: true, data: { importedCount } };
  } catch (error) {
    return { success: false, error: githubErrorMessage(error) };
  }
}

function formatCommitAsDevLog(commit: {
  sha: string;
  message: string;
  htmlUrl: string;
  authorName: string;
}): string {
  const summary = commit.message.split("\n")[0]?.trim() || "GitHub commit";
  return `GitHub commit ${commit.sha.slice(0, 7)} by ${commit.authorName}\n${summary}\n${commit.htmlUrl}`;
}

function githubErrorMessage(error: unknown): string {
  if (error instanceof GitHubServiceError) return error.message;
  console.error("[app/actions/github] GitHub integration error", error);
  return "GitHub could not complete this request. Try again shortly.";
}

function revalidateProject(projectId: string): void {
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
}
