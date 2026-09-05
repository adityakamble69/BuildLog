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
import { getProjectById } from "@/app/actions/projects";
import { getTasksByProject } from "@/app/actions/tasks";
import { getDevLogsByProject } from "@/app/actions/dev-logs";
import { getRecentActivity } from "@/app/actions/activity";
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

  const [tasks, devLogs, activity] = await Promise.all([
    getTasksByProject(project.id),
    getDevLogsByProject(project.id),
    getRecentActivity(project.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
              {project.name}
            </h1>
            <ProjectStatusBadge status={project.status as ProjectStatus} />
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
                <DevLogList projectId={project.id} logs={devLogs} />
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="flex flex-col gap-3">
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
