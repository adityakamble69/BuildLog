"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTask, updateTask } from "@/app/actions/tasks";
import {
  TASK_PRIORITIES,
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

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function TaskFormDialog({
  projectId,
  task,
  defaultStatus = "todo",
  trigger,
}: {
  projectId: string;
  task?: Task;
  defaultStatus?: TaskStatus;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const isEditing = Boolean(task);

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(task?.title ?? "");
  const [description, setDescription] = React.useState(
    task?.description ?? ""
  );
  const [status, setStatus] = React.useState<TaskStatus>(
    (task?.status as TaskStatus) ?? defaultStatus
  );
  const [priority, setPriority] = React.useState<TaskPriority>(
    (task?.priority as TaskPriority) ?? "medium"
  );
  const [dueDate, setDueDate] = React.useState(task?.dueDate ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  function resetToInitial() {
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setStatus((task?.status as TaskStatus) ?? defaultStatus);
    setPriority((task?.priority as TaskPriority) ?? "medium");
    setDueDate(task?.dueDate ?? "");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const payload = { projectId, title, description, status, priority, dueDate };
    const result = isEditing
      ? await updateTask({ id: task!.id, ...payload })
      : await createTask(payload);

    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    if (!isEditing) resetToInitial();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetToInitial();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {error ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wire up sign-in flow"
              maxLength={200}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus)}
              >
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-due-date">Due date</Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Saving…"
                  : "Adding…"
                : isEditing
                  ? "Save changes"
                  : "Add task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { TaskFormDialog };
