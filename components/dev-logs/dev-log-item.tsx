"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateDevLog, deleteDevLog } from "@/app/actions/dev-logs";
import { LogAnalysisPanel } from "@/components/ai/log-analysis-panel";
import type { DevLog } from "@/lib/db/schema/dev-logs";
import type { AiInsight } from "@/lib/db/schema/ai-insights";

function DevLogItem({
  log,
  initialInsight = null,
}: {
  log: DevLog;
  initialInsight?: AiInsight | null;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState(log.content);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  async function handleSave() {
    if (!content.trim()) return;
    setError(null);
    setIsPending(true);
    const result = await updateDevLog({ id: log.id, content });
    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setIsEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    setIsPending(true);
    const result = await deleteDevLog(log.id);
    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <div className="group flex flex-col gap-1.5 border-b border-border py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(log.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>

        {!isEditing ? (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground"
              aria-label="Edit entry"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3.5" />
            </Button>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  aria-label="Delete entry"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete log entry</DialogTitle>
                  <DialogDescription>
                    This permanently deletes this development log entry. This
                    can&apos;t be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    disabled={isPending}
                    onClick={() => setDeleteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isPending}
                    onClick={handleDelete}
                  >
                    {isPending ? "Deleting…" : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={4000}
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => {
                setIsEditing(false);
                setContent(log.content);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isPending || !content.trim()}
              onClick={handleSave}
            >
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-foreground">
          {log.content}
        </p>
      )}

      {!isEditing ? (
        <LogAnalysisPanel devLogId={log.id} initialInsight={initialInsight} />
      ) : null}
    </div>
  );
}

export { DevLogItem };
