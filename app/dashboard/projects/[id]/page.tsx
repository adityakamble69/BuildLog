import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { ProjectProgress } from "@/components/projects/project-progress";
import { TaskBoard } from "@/components/tasks/task-board";
import { DevLogList } from "@/components/dev-logs/dev-log-list";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { ProjectReportCard } from "@/components/ai/project-report-card";
import { ShipScoreMeter } from "@/components/dashboard/ship-score-meter";
import { ProjectHealthBadge } from "@/components/dashboard/project-health-badge";
import { ProjectGitHubCard } from "@/components/github/project-github-card";
import { getProjectById } from "@/app/actions/projects";
import { getGitHubConnection } from "@/app/actions/github";
import { getTasksByProject } from "@/app/actions/tasks";
import { getDevLogsByProject } from "@/app/actions/dev-logs";
import { getRecentActivity } from "@/app/actions/activity";
import { getLogAnalysesByProject, getLatestProjectReport } from "@/app/actions/ai";
import {
  calculateShipScore,
  getShipScoreStatus,
  shipScoreInputFromCollections,
} from "@/lib/utils/ship-score";
import type { ProjectStatus } from "@/lib/db/schema/projects";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const [tasks, devLogs, activity, logAnalyses, latestReport, githubConnection] =
    await Promise.all([
      getTasksByProject(project.id),
      getDevLogsByProject(project.id),
      getRecentActivity(project.id),
      getLogAnalysesByProject(project.id),
      getLatestProjectReport(project.id),
      getGitHubConnection(),
    ]);

  // activity is already ordered newest-first (getRecentActivity), so the
  // first entry's timestamp is a valid "last activity" even though the
  // list itself is capped — see shipScoreInputFromCollections.
  const shipScore = calculateShipScore(
    shipScoreInputFromCollections({ tasks, activity, devLogs })
  );
  const shipScoreStatus = getShipScoreStatus(shipScore);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
              {project.name}
            </h1>
            <ProjectStatusBadge status={project.status as ProjectStatus} />
            <ProjectHealthBadge status={shipScoreStatus} />
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {project.description || "No description yet."}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Created{" "}
            {new Date(project.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/dashboard/projects/${project.id}/edit`}>
              <Pencil />
              Edit
            </Link>
          </Button>
          <DeleteProjectDialog
            projectId={project.id}
            projectName={project.name}
            redirectTo="/dashboard/projects"
            trigger={
              <Button variant="destructive">
                <Trash2 />
                Delete
              </Button>
            }
          />
        </div>
      </div>

      <ProjectProgress tasks={tasks} />

      <Separator />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <TaskBoard projectId={project.id} tasks={tasks} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Development log</h2>
            <Card>
              <CardContent className="pt-6">
                <DevLogList
                  projectId={project.id}
                  logs={devLogs}
                  analysesByDevLogId={logAnalyses}
                />
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ship Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipScoreMeter shipScore={shipScore} status={shipScoreStatus} />
            </CardContent>
          </Card>

          <ProjectReportCard projectId={project.id} initialInsight={latestReport} />

          <ProjectGitHubCard
            projectId={project.id}
            isConnected={Boolean(githubConnection)}
            repository={
              project.githubRepositoryId &&
              project.githubRepositoryOwner &&
              project.githubRepositoryName &&
              project.githubRepositoryUrl
                ? {
                    id: project.githubRepositoryId,
                    fullName: `${project.githubRepositoryOwner}/${project.githubRepositoryName}`,
                    url: project.githubRepositoryUrl,
                    lastSyncedAt: project.githubLastSyncedAt,
                  }
                : null
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activity={activity} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
