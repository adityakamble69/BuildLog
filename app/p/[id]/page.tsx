import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Flame, CheckCircle2, Clock, ListTodo } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectHealthBadge } from "@/components/dashboard/project-health-badge";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { ShipScoreMeter } from "@/components/dashboard/ship-score-meter";
import { Logo } from "@/components/layout/logo";
import { getPublicProjectData } from "@/app/actions/projects";
import {
  calculateShipScore,
  getShipScoreStatus,
  shipScoreInputFromCollections,
} from "@/lib/utils/ship-score";
import { calculateStreaks } from "@/lib/utils/streaks";
import type { ProjectStatus } from "@/lib/db/schema/projects";

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicProjectData(id);

  if (!data) {
    notFound();
  }

  const { project, tasks, devLogs } = data;

  const shipScore = calculateShipScore(
    shipScoreInputFromCollections({ tasks, devLogs })
  );
  const shipScoreStatus = getShipScoreStatus(shipScore);
  const streaks = calculateStreaks(devLogs.map((l) => l.createdAt));

  const completedTasks = tasks.filter((t) => t.status === "done");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const todoTasks = tasks.filter((t) => t.status === "todo");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top public navigation bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/70 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Logo />
          </Link>
          <span className="text-border">/</span>
          <span className="font-mono text-xs text-muted-foreground">public build</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-up"
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Track your own build
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="flex flex-col gap-8">
          {/* Project Header */}
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <ProjectStatusBadge status={project.status as ProjectStatus} />
                <ProjectHealthBadge status={shipScoreStatus} />
                <StreakBadge streaks={streaks} />
              </div>

              {project.description ? (
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {project.description}
                </p>
              ) : null}

              {project.tags && project.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-mono text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="font-mono text-xs text-muted-foreground sm:text-right">
              <p>
                Started{" "}
                {new Date(project.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {project.githubRepositoryUrl ? (
                <a
                  href={project.githubRepositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <span>Repository</span>
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-8">
              {/* Tasks overview */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Tasks ({completedTasks.length}/{tasks.length} completed)</h2>
                </div>

                {tasks.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center text-sm text-muted-foreground">
                      No public tasks recorded for this project yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Done */}
                    <div className="flex flex-col gap-2 rounded-lg border border-border/80 bg-card p-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-success">
                        <CheckCircle2 className="size-3.5" />
                        <span>Completed ({completedTasks.length})</span>
                      </div>
                      <div className="flex flex-col gap-1.5 text-sm">
                        {completedTasks.slice(0, 5).map((t) => (
                          <div
                            key={t.id}
                            className="rounded border border-border/40 bg-muted/20 px-2.5 py-1.5 text-xs line-through text-muted-foreground"
                          >
                            {t.title}
                          </div>
                        ))}
                        {completedTasks.length > 5 ? (
                          <p className="font-mono text-[11px] text-muted-foreground">
                            +{completedTasks.length - 5} more completed
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* In Progress */}
                    <div className="flex flex-col gap-2 rounded-lg border border-border/80 bg-card p-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-primary">
                        <Clock className="size-3.5" />
                        <span>In Progress ({inProgressTasks.length})</span>
                      </div>
                      <div className="flex flex-col gap-1.5 text-sm">
                        {inProgressTasks.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">None right now</p>
                        ) : (
                          inProgressTasks.map((t) => (
                            <div
                              key={t.id}
                              className="rounded border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-medium"
                            >
                              {t.title}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Todo */}
                    <div className="flex flex-col gap-2 rounded-lg border border-border/80 bg-card p-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                        <ListTodo className="size-3.5" />
                        <span>Planned ({todoTasks.length})</span>
                      </div>
                      <div className="flex flex-col gap-1.5 text-sm">
                        {todoTasks.slice(0, 5).map((t) => (
                          <div
                            key={t.id}
                            className="rounded border border-border/40 bg-muted/10 px-2.5 py-1.5 text-xs"
                          >
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Dev Logs Timeline */}
              <section className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold">Development Log Timeline</h2>
                {devLogs.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center text-sm text-muted-foreground">
                      No development logs published yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-3">
                    {devLogs.map((log) => (
                      <Card key={log.id} className="border-border/60">
                        <CardContent className="flex flex-col gap-1.5 p-4">
                          <span className="font-mono text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                            {log.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar with Ship Score */}
            <aside className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ship Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShipScoreMeter shipScore={shipScore} status={shipScoreStatus} />
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Flame className="size-4 text-amber-500" />
                    <span>Public Build Showcase</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This project is publicly documented by its creator using DevTrace.
                  </p>
                  <Link
                    href="/sign-up"
                    className="mt-2 text-center rounded bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Start your journal
                  </Link>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
