import { Badge } from "@/components/ui/badge";
import type { TaskPriority } from "@/lib/db/schema/tasks";

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; variant: "outline" | "warning" | "destructive" }
> = {
  low: { label: "Low", variant: "outline" },
  medium: { label: "Medium", variant: "warning" },
  high: { label: "High", variant: "destructive" },
};

function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { TaskPriorityBadge };
