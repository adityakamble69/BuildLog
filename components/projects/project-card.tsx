import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectCardActions } from "@/components/projects/project-card-actions";
import { ProjectHealthBadge } from "@/components/dashboard/project-health-badge";
import type { Project, ProjectStatus } from "@/lib/db/schema/projects";
import type { ShipScoreStatus } from "@/lib/utils/ship-score";

function ProjectCard({
  project,
  healthStatus,
}: {
  project: Project;
  /** Optional — omitted where a Ship Score hasn't been computed for this list. */
  healthStatus?: ShipScoreStatus;
}) {
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

        <ProjectCardActions projectId={project.id} projectName={project.name} />
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ProjectStatusBadge status={project.status as ProjectStatus} />
            {healthStatus ? <ProjectHealthBadge status={healthStatus} /> : null}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {new Date(project.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {project.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { ProjectCard };
