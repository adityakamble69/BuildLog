import Link from "next/link";
import { notFound } from "next/navigation";
import { ListChecks, NotebookPen, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { getProjectById } from "@/app/actions/projects";
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

      <Separator />

      {/* Tasks and development logs land in Phase 5 — placeholders for now. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Task tracking arrives in the next phase of BuildLog."
        />
        <EmptyState
          icon={NotebookPen}
          title="No development logs yet"
          description="Development logs arrive in the next phase of BuildLog."
        />
      </div>
    </div>
  );
}
