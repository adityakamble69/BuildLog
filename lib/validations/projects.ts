import { z } from "zod";

import { nonEmptyString, uuidSchema } from "@/lib/validations/common";
import { PROJECT_STATUSES } from "@/lib/db/schema/projects";

// Per docs/database.md #8 and docs/rules.md #13: validate required
// strings, string lengths, enum values, and UUIDs at every server
// boundary — never trust client-supplied data.

export const projectStatusSchema = z.enum(PROJECT_STATUSES);

export const createProjectSchema = z.object({
  name: nonEmptyString(120),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  status: projectStatusSchema.default("active"),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: uuidSchema,
});

export const projectIdSchema = z.object({
  id: uuidSchema,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
