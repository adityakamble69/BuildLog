import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import type { Project, ProjectStatus } from "@/lib/db/schema/projects";

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group relative flex flex-col justify-between">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="flex flex-col gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <CardTitle className="line-clamp-1">{project.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {project.description || "No description yet."}
          </CardDescription>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground"
              aria-label={`Actions for ${project.name}`}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/projects/${project.id}/edit`}>
                <Pencil />
                Edit
              </Link>
            </DropdownMenuItem>
            <DeleteProjectDialog
              projectId={project.id}
              projectName={project.name}
              trigger={
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex items-center justify-between">
        <ProjectStatusBadge status={project.status as ProjectStatus} />
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(project.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </CardContent>
    </Card>
  );
}

export { ProjectCard };
