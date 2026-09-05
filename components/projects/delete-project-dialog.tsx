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
import { deleteProject } from "@/app/actions/projects";

function DeleteProjectDialog({
  projectId,
  projectName,
  redirectTo,
  trigger,
}: {
  projectId: string;
  projectName: string;
  /** Where to send the user after a successful delete. If omitted, the current list just refreshes. */
  redirectTo?: string;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleDelete() {
    setError(null);
    setIsPending(true);
    const result = await deleteProject(projectId);
    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            This permanently deletes <span className="font-medium text-foreground">{projectName}</span>{" "}
            along with its tasks, development logs, and AI insights. This
            can&apos;t be undone.
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
            {isPending ? "Deleting…" : "Delete project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteProjectDialog };
