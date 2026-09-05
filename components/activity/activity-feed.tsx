import {
  CheckCircle2,
  GitBranch,
  NotebookPen,
  Plus,
  RefreshCw,
  Trash2,
  Unlink,
  type LucideIcon,
} from "lucide-react";

import type { ActivityLog } from "@/lib/db/schema/activity-logs";

const ACTION_ICONS: Record<string, LucideIcon> = {
  task_created: Plus,
  task_completed: CheckCircle2,
  task_status_changed: RefreshCw,
  task_deleted: Trash2,
  dev_log_added: NotebookPen,
  github_repository_linked: GitBranch,
  github_repository_unlinked: Unlink,
  github_commits_synced: GitBranch,
};

/** Known activity actions, in display order — shared with the activity filter UI. */
export const ACTIVITY_ACTIONS = [
  { value: "task_created", label: "Task created" },
  { value: "task_completed", label: "Task completed" },
  { value: "task_status_changed", label: "Task status changed" },
  { value: "task_deleted", label: "Task deleted" },
  { value: "dev_log_added", label: "Dev log added" },
  { value: "github_repository_linked", label: "GitHub repository linked" },
  { value: "github_repository_unlinked", label: "GitHub repository unlinked" },
  { value: "github_commits_synced", label: "GitHub commits synced" },
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
    case "github_repository_linked":
      return typeof meta.repository === "string"
        ? `Linked GitHub repository ${meta.repository}`
        : "Linked a GitHub repository";
    case "github_repository_unlinked":
      return "Unlinked a GitHub repository";
    case "github_commits_synced": {
      const importedCount = typeof meta.importedCount === "number" ? meta.importedCount : null;
      return importedCount === 1
        ? "Imported 1 GitHub commit"
        : importedCount !== null
          ? `Imported ${importedCount} GitHub commits`
          : "Synced GitHub commits";
    }
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