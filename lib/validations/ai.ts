import { z } from "zod";

import { uuidSchema } from "@/lib/validations/common";

// Per docs/rules.md #13: AI request payloads are validated at the server
// boundary like any other input, and per docs/PRD.md #8 AI output must be
// validated/normalized — never stored or rendered as raw model output.

export const devLogAnalysisRequestSchema = z.object({
  devLogId: uuidSchema,
});

export const projectReportRequestSchema = z.object({
  projectId: uuidSchema,
});

/**
 * Shape of a `log_analysis` ai_insights.content payload.
 * Kept small and UI-friendly rather than mirroring raw model output.
 */
export const logAnalysisResultSchema = z.object({
  summary: z.string().trim().min(1).max(600),
  blockers: z.array(z.string().trim().min(1).max(200)).max(6),
  nextActions: z.array(z.string().trim().min(1).max(200)).max(6),
  topics: z.array(z.string().trim().min(1).max(60)).max(8),
});

export type LogAnalysisResult = z.infer<typeof logAnalysisResultSchema>;

/** Shape of a `report` ai_insights.content payload. */
export const projectReportResultSchema = z.object({
  progressSummary: z.string().trim().min(1).max(800),
  accomplishments: z.array(z.string().trim().min(1).max(200)).max(8),
  blockers: z.array(z.string().trim().min(1).max(200)).max(8),
  nextSteps: z.array(z.string().trim().min(1).max(200)).max(8),
});

export type ProjectReportResult = z.infer<typeof projectReportResultSchema>;
