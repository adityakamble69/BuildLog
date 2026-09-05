import { FolderKanban } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/project-card";
import type { Project } from "@/lib/db/schema/projects";
import type { ShipScoreStatus } from "@/lib/utils/ship-score";

function ProjectList({
  projects,
  healthByProjectId,
}: {
  projects: Project[];
  /** Optional — keyed by project id. Omitted where Ship Score wasn't computed for this list. */
  healthByProjectId?: Map<string, ShipScoreStatus>;
}) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create your first project to start tracking your build."
        action={
          <Button asChild>
            <Link href="/dashboard/projects/new">Create project</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          healthStatus={healthByProjectId?.get(project.id)}
        />
      ))}
    </div>
  );
}

export { ProjectList };
