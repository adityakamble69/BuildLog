import type { Task } from "@/lib/db/schema/tasks";

/**
 * Per docs/database.md #11: completed tasks / total tasks * 100,
 * with the zero-task case handled explicitly rather than showing 0%.
 */
function ProjectProgress({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;

  if (total === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-sm text-muted-foreground">
          No tasks yet — progress will show up once you add some.
        </p>
      </div>
    );
  }

  const completed = tasks.filter((t) => t.status === "done").length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-mono font-medium text-foreground">
          {percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        {completed} / {total} tasks done
      </p>
    </div>
  );
}

export { ProjectProgress };
