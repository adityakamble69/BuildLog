"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createDevLog } from "@/app/actions/dev-logs";

function DevLogForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [content, setContent] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    setIsPending(true);
    const result = await createDevLog({ projectId, content });
    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What did you work on?"
        maxLength={4000}
        rows={3}
        aria-label="New development log entry"
      />

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? "Logging…" : "Add entry"}
        </Button>
      </div>
    </form>
  );
}

export { DevLogForm };
