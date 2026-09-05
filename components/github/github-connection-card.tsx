import Link from "next/link";
import { Github, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SafeGitHubConnection } from "@/lib/github/service";

function GitHubConnectionCard({
  connection,
  configured,
}: {
  connection: SafeGitHubConnection | null;
  configured: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="flex items-center gap-2">
            <Github className="size-4" />
            GitHub
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Link repositories to projects and import recent commits on demand.
          </p>
        </div>
        {configured ? (
          <Button size="sm" variant={connection ? "secondary" : "default"} asChild>
            <Link href="/api/github/connect">
              <Github />
              {connection ? "Reconnect" : "Connect GitHub"}
            </Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {connection ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
            {connection.avatarUrl ? (
              // GitHub controls this image URL; no token or user data is sent to it.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={connection.avatarUrl}
                alt=""
                className="size-9 rounded-full border border-border"
              />
            ) : (
              <Github className="size-9 rounded-full border border-border p-2 text-muted-foreground" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">@{connection.login}</p>
              <p className="text-xs text-muted-foreground">
                {connection.name ?? "GitHub account"} · connected{" "}
                {new Date(connection.connectedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ) : configured ? (
          <p className="text-sm text-muted-foreground">
            Connect GitHub to choose repositories and import their latest commits.
          </p>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <p>
              GitHub is not configured on this server yet. Add the GitHub OAuth and
              encryption variables from <code>.env.example</code>, then restart the
              app.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { GitHubConnectionCard };
