import { AiServiceError, callAiForJson } from "@/lib/ai/client";
import {
  learningSummaryResultSchema,
  type LearningSummaryResult,
} from "@/lib/validations/ai";
import type { DevLog } from "@/lib/db/schema/dev-logs";

const SYSTEM_PROMPT = `You are the technical learnings analyst embedded in DevTrace, a developer's project tracker and journal.

You will be given a project's development log entries. Your task is to distill key technical learnings, architectural decisions, and reusable tips from what was built.
Base your analysis strictly on the provided development logs — do not hallucinate discoveries or context not implied by the logs.

Respond with a single JSON object and nothing else, matching exactly this shape:
{
  "overview": string,            // 2-3 sentences summarizing the technical progression and main lessons learned
  "keyLearnings": string[],      // concrete technical discoveries, bug resolutions, or insights gained; [] if unclear
  "decisions": string[],         // architectural, library, or design decisions recorded in the logs; [] if none evident
  "patternsAndTips": string[]    // reusable patterns, workflow tips, or guidelines to carry forward; [] if none evident
}

Keep each array to at most 8 items, each concise and direct. Do not include markdown or text outside the JSON object.`;

function summarizeLogs(logs: DevLog[]): string {
  if (logs.length === 0) {
    return "No development log entries available.";
  }

  return logs
    .map((log) => {
      const date = new Date(log.createdAt).toISOString().slice(0, 10);
      return `- (${date}) ${log.content}`;
    })
    .join("\n");
}

/**
 * Generates an AI-synthesized Learning Summary from project development logs.
 * Throws AiServiceError on any validation or provider error.
 */
export async function generateLearningSummary(params: {
  projectName: string;
  projectDescription: string | null;
  logs: DevLog[];
}): Promise<LearningSummaryResult> {
  if (params.logs.length === 0) {
    throw new AiServiceError(
      "No development logs recorded yet. Add some dev logs to generate a learning summary."
    );
  }

  const userPrompt = [
    `Project: ${params.projectName}`,
    params.projectDescription
      ? `Description: ${params.projectDescription}`
      : null,
    "",
    "Development log entries (newest first):",
    summarizeLogs(params.logs),
  ]
    .filter((line) => line !== null)
    .join("\n");

  const raw = await callAiForJson({ system: SYSTEM_PROMPT, user: userPrompt });

  const parsed = learningSummaryResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AiServiceError(
      "The AI response did not match the expected learning summary format."
    );
  }

  return parsed.data;
}
