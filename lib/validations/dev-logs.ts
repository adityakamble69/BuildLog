import { z } from "zod";

import { nonEmptyString, uuidSchema } from "@/lib/validations/common";

// Per docs/database.md #8: development log content must not be empty.

export const createDevLogSchema = z.object({
  projectId: uuidSchema,
  content: nonEmptyString(4000),
});

export const updateDevLogSchema = z.object({
  id: uuidSchema,
  content: nonEmptyString(4000),
});

export const devLogIdSchema = z.object({
  id: uuidSchema,
});

export type CreateDevLogInput = z.infer<typeof createDevLogSchema>;
export type UpdateDevLogInput = z.infer<typeof updateDevLogSchema>;
