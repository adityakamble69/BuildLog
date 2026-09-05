import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/lib/db/schema/tasks";

const COLUMN_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

function TaskBoard({
  projectId,
  tasks,
}: {
  projectId: string;
  tasks: Task[];
}) {
  const byStatus: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
  };
  for (const task of tasks) {
    byStatus[task.status as TaskStatus]?.push(task);
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {TASK_STATUSES.map((columnStatus) => (
        <div key={columnStatus} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {COLUMN_LABELS[columnStatus]}
              <span className="font-mono text-xs text-muted-foreground/70">
                {byStatus[columnStatus].length}
              </span>
            </h3>
            <TaskFormDialog
              projectId={projectId}
              defaultStatus={columnStatus}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground"
                  aria-label={`Add task to ${COLUMN_LABELS[columnStatus]}`}
                >
                  <Plus className="size-4" />
                </Button>
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            {byStatus[columnStatus].length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                Nothing here
              </p>
            ) : (
              byStatus[columnStatus].map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export { TaskBoard };
