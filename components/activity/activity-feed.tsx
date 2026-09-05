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

/** Known activity actions, in display order — shared with the activity filter UI. */
export const ACTIVITY_ACTIONS = [
  { value: "task_created", label: "Task created" },
  { value: "task_completed", label: "Task completed" },
  { value: "task_status_changed", label: "Task status changed" },
  { value: "task_deleted", label: "Task deleted" },
  { value: "dev_log_added", label: "Dev log added" },
] as const;

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

type ActivityFeedEntry = ActivityLog & { projectName?: string };

/**
 * `projectName` is only present when the feed spans multiple projects
 * (the dashboard's cross-project feed) — a single project's own
 * activity feed has no need to repeat its own name.
 */
function ActivityFeed({ activity }: { activity: ActivityFeedEntry[] }) {
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
              <div className="flex items-center gap-1.5">
                {entry.projectName ? (
                  <span className="text-xs text-muted-foreground">
                    {entry.projectName} ·
                  </span>
                ) : null}
                <p className="font-mono text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export { ActivityFeed };
