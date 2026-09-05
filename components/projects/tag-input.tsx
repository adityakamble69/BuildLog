"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_TAGS = 6;
const MAX_TAG_LENGTH = 30;

/**
 * Chip-style tag editor: type a tag and press Enter/comma to add it,
 * Backspace on an empty input removes the last chip. Mirrors the
 * normalization the server applies (lib/validations/projects.ts) —
 * trimmed, lowercased, deduplicated, capped at MAX_TAGS — so the input
 * never shows a state the server would silently rewrite.
 */
function TagInput({
  value,
  onChange,
  id,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  id?: string;
}) {
  const [draft, setDraft] = React.useState("");

  function commitDraft() {
    const tag = draft.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    setDraft("");
    if (!tag || value.includes(tag) || value.length >= MAX_TAGS) return;
    onChange([...value, tag]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="rounded-full p-0.5 hover:bg-accent"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {value.length < MAX_TAGS ? (
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? "e.g. frontend, side-project" : "Add another…"}
          maxLength={MAX_TAG_LENGTH}
          className="h-6 flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
        />
      ) : null}
    </div>
  );
}

export { TagInput };
