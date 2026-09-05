"use client";

import * as React from "react";
import { ExternalLink, Link2, RefreshCw, Unlink } from "lucide-react";
import { useRouter } from "next/navigation";

import { GithubLogo } from "@/components/icons/github-logo";

import {
  linkGitHubRepository,
  listGitHubRepositories,
  syncGitHubCommits,
  unlinkGitHubRepository,
} from "@/app/actions/github";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GitHubRepository } from "@/lib/github/service";

type LinkedRepository = {
  id: number;
  fullName: string;
  url: string;
  lastSyncedAt: Date | null;
};

function ProjectGitHubCard({
  projectId,
  isConnected,
  repository,
}: {
  projectId: string;
  isConnected: boolean;
  repository: LinkedRepository | null;
}) {
  const router = useRouter();
  const [repositories, setRepositories] = React.useState<GitHubRepository[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = React.useState("");
  const [isLoadingRepositories, setIsLoadingRepositories] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isError, setIsError] = React.useState(false);

  async function loadRepositories() {
    setIsLoadingRepositories(true);
    setMessage(null);
    const result = await listGitHubRepositories();
    setIsLoadingRepositories(false);

    if (!result.success) {
      setIsError(true);
      setMessage(result.error);
      return;
    }

    setRepositories(result.data);
    setIsError(false);
    if (result.data.length === 0) {
      setMessage("No repositories are available through this GitHub connection.");
    }
  }

  async function linkRepository() {
    if (!selectedRepositoryId) return;
    setIsSaving(true);
    setMessage(null);
    const result = await linkGitHubRepository({
      projectId,
      repositoryId: selectedRepositoryId,
    });
    setIsSaving(false);

    if (!result.success) {
      setIsError(true);
      setMessage(result.error);
      return;
    }

    setIsError(false);
    setMessage("Repository linked.");
    router.refresh();
  }

  async function syncCommits() {
    setIsSaving(true);
    setMessage(null);
    const result = await syncGitHubCommits({ projectId });
    setIsSaving(false);

    if (!result.success) {
      setIsError(true);
      setMessage(result.error);
      return;
    }

    setIsError(false);
    setMessage(
      result.data.importedCount === 0
        ? "Already up to date — no new commits found."
        : `${result.data.importedCount} commit${result.data.importedCount === 1 ? "" : "s"} imported into the development log.`
    );
    router.refresh();
  }

  async function unlinkRepository() {
    setIsSaving(true);
    setMessage(null);
    const result = await unlinkGitHubRepository({ projectId });
    setIsSaving(false);

    if (!result.success) {
      setIsError(true);
      setMessage(result.error);
      return;
    }

    setRepositories([]);
    setSelectedRepositoryId("");
    setIsError(false);
    setMessage("Repository unlinked. Imported development logs were kept.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GithubLogo className="size-4" />
          GitHub repository
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!isConnected ? (
          <p className="text-sm text-muted-foreground">
            Connect GitHub in Settings before linking a repository.
          </p>
        ) : repository ? (
          <>
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <a
                href={repository.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                {repository.fullName}
                <ExternalLink className="size-3.5" />
              </a>
              <p className="mt-1 text-xs text-muted-foreground">
                {repository.lastSyncedAt
                  ? `Last synced ${new Date(repository.lastSyncedAt).toLocaleString()}`
                  : "Not synced yet"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={syncCommits} disabled={isSaving}>
                <RefreshCw className={isSaving ? "animate-spin" : undefined} />
                Sync commits
              </Button>
              <Button size="sm" variant="ghost" onClick={unlinkRepository} disabled={isSaving}>
                <Unlink />
                Unlink
              </Button>
            </div>
          </>
        ) : (
          <>
            {repositories.length === 0 ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={loadRepositories}
                disabled={isLoadingRepositories}
              >
                <Link2 />
                {isLoadingRepositories ? "Loading repositories…" : "Choose repository"}
              </Button>
            ) : (
              <>
                <Select value={selectedRepositoryId} onValueChange={setSelectedRepositoryId}>
                  <SelectTrigger aria-label="GitHub repository">
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.fullName}{item.isPrivate ? " · private" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={linkRepository} disabled={!selectedRepositoryId || isSaving}>
                    <Link2 />
                    {isSaving ? "Linking…" : "Link repository"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={loadRepositories} disabled={isLoadingRepositories}>
                    Refresh
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {message ? (
          <p className={`text-xs ${isError ? "text-destructive" : "text-muted-foreground"}`}>
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { ProjectGitHubCard };