import {
  CheckCircle2,
  NotebookPen,
  Plus,
  RefreshCw,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import type { ActivityLog } from "@/lib/db/schema/activity-logs";

const ACTION_ICONS: Record<string, LucideIcon> = {
  task_created: Plus,
  task_completed: CheckCircle2,
  task_status_changed: RefreshCw,
  task_deleted: Trash2,
  dev_log_added: NotebookPen,
};

function describeActivity(entry: ActivityLog): string {
  const meta = (entry.metadata ?? {}) as Record<string, unknown>;
  const title = typeof meta.title === "string" ? meta.title : undefined;

  switch (entry.action) {
    case "task_created":
      return title ? `Created task "${title}"` : "Created a task";
    case "task_completed":
      return title ? `Completed "${title}"` : "Completed a task";
    case "task_status_changed": {
      const to = typeof meta.to === "string" ? meta.to.replace("_", " ") : undefined;
      return title && to
        ? `Moved "${title}" to ${to}`
        : "Changed a task's status";
    }
    case "task_deleted":
      return title ? `Deleted task "${title}"` : "Deleted a task";
    case "dev_log_added":
      return "Added a development log entry";
    default:
      return entry.action.replace(/_/g, " ");
  }
}

function ActivityFeed({ activity }: { activity: ActivityLog[] }) {
  if (activity.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
        No activity yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {activity.map((entry) => {
        const Icon = ACTION_ICONS[entry.action] ?? RefreshCw;
        return (
          <li key={entry.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
              <Icon className="size-3.5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-foreground">
                {describeActivity(entry)}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export { ActivityFeed };
