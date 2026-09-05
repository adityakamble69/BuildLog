import { z } from "zod";

// Per docs/rules.md: validate required strings, string lengths, enum
// values, UUIDs, and optional dates at every server boundary.

export const uuidSchema = z.uuid();

export const nonEmptyString = (max: number) =>
  z.string().trim().min(1, "This field is required.").max(max);

export const optionalDateSchema = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date.")
  .optional()
  .or(z.literal("").transform(() => undefined));
