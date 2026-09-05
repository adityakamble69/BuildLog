import "server-only";

import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { githubConnections } from "@/lib/db/schema/github-connections";

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";

const gitHubUserSchema = z.object({
  id: z.number().int().positive(),
  login: z.string().min(1).max(255),
  name: z.string().nullable(),
  avatar_url: z.string().url(),
});

const gitHubRepositorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  full_name: z.string().min(1).max(255),
  html_url: z.string().url(),
  private: z.boolean(),
  default_branch: z.string().nullable(),
  owner: z.object({ login: z.string().min(1).max(255) }),
});

const gitHubCommitSchema = z.object({
  sha: z.string().min(7).max(64),
  html_url: z.string().url(),
  author: z.object({ login: z.string().min(1).max(255) }).nullable(),
  commit: z.object({
    message: z.string().min(1),
    author: z.object({
      name: z.string().min(1).max(255),
      date: z.string().datetime(),
    }),
  }),
});

export type GitHubRepository = {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  isPrivate: boolean;
  owner: string;
  defaultBranch: string | null;
};

export type GitHubCommit = {
  sha: string;
  htmlUrl: string;
  message: string;
  authorLogin: string | null;
  authorName: string;
  committedAt: Date;
};

export type SafeGitHubConnection = {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  connectedAt: Date;
};

export class GitHubServiceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "GitHubServiceError";
    if (options?.cause !== undefined) this.cause = options.cause;
  }
}

function getEncryptionKey(): Buffer {
  const encodedKey = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!encodedKey) {
    throw new GitHubServiceError(
      "GitHub integration is not configured on this server."
    );
  }

  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) {
    throw new GitHubServiceError(
      "GitHub integration is not configured on this server."
    );
  }

  return key;
}

/** Ensures only a server-side, 32-byte encryption key enables the feature. */
export function isGitHubConfigured(): boolean {
  try {
    return Boolean(
      process.env.GITHUB_CLIENT_ID &&
        process.env.GITHUB_CLIENT_SECRET &&
        getEncryptionKey()
    );
  } catch {
    return false;
  }
}

export function getGitHubOAuthConfig(): {
  clientId: string;
  clientSecret: string;
} {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret || !isGitHubConfigured()) {
    throw new GitHubServiceError(
      "GitHub integration is not configured on this server."
    );
  }

  return { clientId, clientSecret };
}

function encryptAccessToken(token: string, userId: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  cipher.setAAD(Buffer.from(userId));

  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

function decryptAccessToken(encryptedToken: string, userId: string): string {
  const [iv, authTag, ciphertext, extra] = encryptedToken.split(".");
  if (!iv || !authTag || !ciphertext || extra) {
    throw new GitHubServiceError("The saved GitHub connection is invalid.");
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(iv, "base64url")
    );
    decipher.setAAD(Buffer.from(userId));
    decipher.setAuthTag(Buffer.from(authTag, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch (error) {
    throw new GitHubServiceError("The saved GitHub connection is invalid.", {
      cause: error,
    });
  }
}

async function getConnectionForUser(userId: string) {
  const [connection] = await db
    .select()
    .from(githubConnections)
    .where(eq(githubConnections.userId, userId))
    .limit(1);

  return connection ?? null;
}

/** Safe account metadata for Server Components. It deliberately omits tokens. */
export async function getSafeGitHubConnection(
  userId: string
): Promise<SafeGitHubConnection | null> {
  const connection = await getConnectionForUser(userId);
  if (!connection) return null;

  return {
    login: connection.githubLogin,
    name: connection.githubName,
    avatarUrl: connection.githubAvatarUrl,
    connectedAt: connection.createdAt,
  };
}

export async function getGitHubAccessToken(userId: string): Promise<string> {
  const connection = await getConnectionForUser(userId);
  if (!connection) {
    throw new GitHubServiceError("Connect GitHub before linking a repository.");
  }

  return decryptAccessToken(connection.encryptedAccessToken, userId);
}

export async function saveGitHubConnection(params: {
  userId: string;
  accessToken: string;
  scopes: string | null;
  user: z.infer<typeof gitHubUserSchema>;
}): Promise<void> {
  const encryptedAccessToken = encryptAccessToken(params.accessToken, params.userId);

  await db
    .insert(githubConnections)
    .values({
      userId: params.userId,
      githubUserId: params.user.id,
      githubLogin: params.user.login,
      githubName: params.user.name,
      githubAvatarUrl: params.user.avatar_url,
      encryptedAccessToken,
      scopes: params.scopes,
    })
    .onConflictDoUpdate({
      target: githubConnections.userId,
      set: {
        githubUserId: params.user.id,
        githubLogin: params.user.login,
        githubName: params.user.name,
        githubAvatarUrl: params.user.avatar_url,
        encryptedAccessToken,
        scopes: params.scopes,
        updatedAt: new Date(),
      },
    });
}

export async function deleteGitHubConnection(userId: string): Promise<void> {
  await db.delete(githubConnections).where(eq(githubConnections.userId, userId));
}

async function githubApi<T>(
  path: string,
  token: string,
  schema: z.ZodType<T>
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${GITHUB_API_URL}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new GitHubServiceError("Could not reach GitHub.", { cause: error });
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new GitHubServiceError(
        "GitHub access was denied. Reconnect GitHub and try again."
      );
    }
    if (response.status === 404) {
      throw new GitHubServiceError("The selected GitHub repository was not found.");
    }
    throw new GitHubServiceError("GitHub could not complete this request.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new GitHubServiceError("GitHub returned an invalid response.", {
      cause: error,
    });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new GitHubServiceError("GitHub returned an unexpected response.");
  }

  return parsed.data;
}

export async function getGitHubUser(accessToken: string) {
  return githubApi("/user", accessToken, gitHubUserSchema);
}

export async function listGitHubRepositories(
  accessToken: string
): Promise<GitHubRepository[]> {
  const repositories = await githubApi(
    "/user/repos?affiliation=owner%2Ccollaborator%2Corganization_member&sort=updated&per_page=100",
    accessToken,
    z.array(gitHubRepositorySchema)
  );

  return repositories.map((repository) => ({
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    htmlUrl: repository.html_url,
    isPrivate: repository.private,
    owner: repository.owner.login,
    defaultBranch: repository.default_branch,
  }));
}

export async function listGitHubCommits(
  accessToken: string,
  owner: string,
  repository: string
): Promise<GitHubCommit[]> {
  const commits = await githubApi(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commits?per_page=30`,
    accessToken,
    z.array(gitHubCommitSchema)
  );

  return commits.map((commit) => ({
    sha: commit.sha,
    htmlUrl: commit.html_url,
    message: commit.commit.message,
    authorLogin: commit.author?.login ?? null,
    authorName: commit.commit.author.name,
    committedAt: new Date(commit.commit.author.date),
  }));
}

/** Tests that a repository ID is among the current user's authorized repos. */
export async function getAuthorizedRepository(
  accessToken: string,
  repositoryId: number
): Promise<GitHubRepository | null> {
  const repositories = await listGitHubRepositories(accessToken);
  return repositories.find((repository) => repository.id === repositoryId) ?? null;
}

export async function isGitHubConnectionOwnedBy(
  userId: string,
  githubUserId: number
): Promise<boolean> {
  const [connection] = await db
    .select({ id: githubConnections.id })
    .from(githubConnections)
    .where(
      and(
        eq(githubConnections.userId, userId),
        eq(githubConnections.githubUserId, githubUserId)
      )
    )
    .limit(1);

  return Boolean(connection);
}
