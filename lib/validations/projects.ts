import { z } from "zod";

import { nonEmptyString, optionalString, uuidSchema } from "@/lib/validations/common";
import { PROJECT_STATUSES } from "@/lib/db/schema/projects";

// Per docs/database.md #8 and docs/rules.md #13: validate required
// strings, string lengths, enum values, and UUIDs at every server
// boundary — never trust client-supplied data.

export const projectStatusSchema = z.enum(PROJECT_STATUSES);

const MAX_TAGS = 6;
const MAX_TAG_LENGTH = 30;

/**
 * Tags are free-form per-project labels (docs/phases.md Phase 10).
 * Trimmed, lowercased for consistent filtering/matching, empty entries
 * dropped, duplicates removed, capped at MAX_TAGS.
 */
export const projectTagsSchema = z
  .array(z.string().trim().toLowerCase().max(MAX_TAG_LENGTH, "Tag is too long."))
  .default([])
  .transform((tags) => [...new Set(tags.filter((t) => t.length > 0))])
  .refine((tags) => tags.length <= MAX_TAGS, `You can add up to ${MAX_TAGS} tags.`);

export const createProjectSchema = z.object({
  name: nonEmptyString(120),
  description: optionalString(2000, "Description is too long."),
  status: projectStatusSchema.default("active"),
  isPublic: z.boolean().optional().default(false),
  tags: projectTagsSchema,
});

export const updateProjectSchema = createProjectSchema.extend({
  id: uuidSchema,
});

export const projectIdSchema = z.object({
  id: uuidSchema,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
