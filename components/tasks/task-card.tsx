"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { updateTaskStatus } from "@/app/actions/tasks";
import {
  TASK_STATUSES,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/db/schema/tasks";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

function TaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const status = task.status as TaskStatus;

  async function handleStatusChange(next: TaskStatus) {
    if (next === status) return;
    setIsPending(true);
    await updateTaskStatus({ id: task.id, status: next });
    setIsPending(false);
    router.refresh();
  }

  return (
    <Card className={isPending ? "opacity-60" : undefined}>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p
            className={
              "text-sm font-medium leading-snug " +
              (status === "done" ? "text-muted-foreground line-through" : "")
            }
          >
            {task.title}
          </p>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-1 size-7 shrink-0 text-muted-foreground"
                aria-label={`Actions for ${task.title}`}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              {TASK_STATUSES.filter((s) => s !== status).map((s) => (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => handleStatusChange(s)}
                >
                  {STATUS_LABELS[s]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <TaskFormDialog
                projectId={task.projectId}
                task={task}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                }
              />
              <DeleteTaskDialog
                taskId={task.id}
                taskTitle={task.title}
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
        </div>

        {task.description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <TaskPriorityBadge priority={task.priority as TaskPriority} />
          {task.dueDate ? (
            <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export { TaskCard };
