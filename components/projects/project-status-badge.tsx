import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/db/schema/projects";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; variant: "success" | "secondary" | "outline" }
> = {
  active: { label: "Active", variant: "success" },
  completed: { label: "Completed", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
};

function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { ProjectStatusBadge };
