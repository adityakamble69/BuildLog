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

/**
 * An optional, trimmed string capped at `max` chars, where an empty (or
 * whitespace-only) input normalizes to `undefined`.
 *
 * NOTE: this uses `z.preprocess` rather than the more common
 * `z.string().optional().or(z.literal("").transform(() => undefined))`
 * pattern, because that pattern is broken for plain strings: an empty
 * string already satisfies `z.string()...optional()` (the first union
 * branch), so Zod never falls through to the `literal("")` branch and
 * `""` is returned as-is instead of `undefined`. Normalizing with
 * `preprocess` up front avoids the ordering pitfall entirely — it works
 * regardless of what the "real" schema branch does with an empty string.
 */
export const optionalString = (max: number, message = "This field is too long.") =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().trim().max(max, message).optional()
  );
