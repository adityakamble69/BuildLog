"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/projects/tag-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject, updateProject } from "@/app/actions/projects";
import {
  PROJECT_STATUSES,
  type Project,
  type ProjectStatus,
} from "@/lib/db/schema/projects";

const STATUS_LABELS: Record<(typeof PROJECT_STATUSES)[number], string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const isEditing = Boolean(project);

  const [name, setName] = React.useState(project?.name ?? "");
  const [description, setDescription] = React.useState(
    project?.description ?? ""
  );
  const [status, setStatus] = React.useState<ProjectStatus>(
    (project?.status as ProjectStatus) ?? "active"
  );
  const [tags, setTags] = React.useState<string[]>(project?.tags ?? []);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const result = isEditing
      ? await updateProject({ id: project!.id, name, description, status, tags })
      : await createProject({ name, description, status, tags });

    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (isEditing) {
      router.push(`/dashboard/projects/${result.data.id}`);
    } else {
      router.push(`/dashboard/projects/${result.data.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. DevTrace"
          maxLength={120}
          required
          aria-invalid={error ? true : undefined}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you building?"
          maxLength={2000}
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tags">Tags</Label>
        <TagInput id="tags" value={tags} onChange={setTags} />
        <p className="text-xs text-muted-foreground">
          Up to 6 tags. Press Enter or comma to add one.
        </p>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save changes"
              : "Create project"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export { ProjectForm };
