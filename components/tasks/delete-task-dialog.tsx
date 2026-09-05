"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteTask } from "@/app/actions/tasks";

function DeleteTaskDialog({
  taskId,
  taskTitle,
  trigger,
}: {
  taskId: string;
  taskTitle: string;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleDelete() {
    setError(null);
    setIsPending(true);
    const result = await deleteTask(taskId);
    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
          <DialogDescription>
            This permanently deletes{" "}
            <span className="font-medium text-foreground">{taskTitle}</span>.
            This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p
            role="alert"
            className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            variant="secondary"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting…" : "Delete task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteTaskDialog };
