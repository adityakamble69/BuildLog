import { z } from "zod";

import { nonEmptyString, optionalString, uuidSchema } from "@/lib/validations/common";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/db/schema/tasks";

// Per docs/database.md #8 and docs/rules.md #13.

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

// due_date is an optional plain date (YYYY-MM-DD, matches the `date`
// Postgres column) rather than a full datetime.
const optionalDueDateSchema = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid due date.")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createTaskSchema = z.object({
  projectId: uuidSchema,
  title: nonEmptyString(200),
  description: optionalString(2000, "Description is too long."),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
  dueDate: optionalDueDateSchema,
});

export const updateTaskSchema = createTaskSchema.extend({
  id: uuidSchema,
});

export const taskIdSchema = z.object({
  id: uuidSchema,
});

export const updateTaskStatusSchema = z.object({
  id: uuidSchema,
  status: taskStatusSchema,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
