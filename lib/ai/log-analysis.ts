import { AiServiceError, callAiForJson } from "@/lib/ai/client";
import {
  logAnalysisResultSchema,
  type LogAnalysisResult,
} from "@/lib/validations/ai";

const SYSTEM_PROMPT = `You are the AI analyst embedded in BuildLog, a developer's project tracker and journal.

You will be given one development log entry written by a solo developer about a single project. Analyze only what the entry actually says — do not invent progress, blockers, or tools it doesn't mention.

Respond with a single JSON object and nothing else, matching exactly this shape:
{
  "summary": string,        // 1-3 sentences: what was actually accomplished in this entry
  "blockers": string[],     // possible blockers or risks implied by the entry; [] if none are evident
  "nextActions": string[],  // concrete, specific next steps suggested by the entry; [] if none are evident
  "topics": string[]        // relevant technical topics/technologies mentioned or implied; [] if none
}

Keep each array to at most 6 short items. Keep the summary under 3 sentences. Do not include markdown, headings, or any text outside the JSON object.`;

/**
 * Analyzes a single development log entry via OpenAI and returns a
 * validated, normalized result. Throws `AiServiceError` on any failure —
 * callers (app/actions/ai.ts) are responsible for degrading gracefully.
 */
export async function analyzeDevLog(params: {
  projectName: string;
  logContent: string;
}): Promise<LogAnalysisResult> {
  const raw = await callAiForJson({
    system: SYSTEM_PROMPT,
    user: `Project: ${params.projectName}\n\nDevelopment log entry:\n"""\n${params.logContent}\n"""`,
  });

  const parsed = logAnalysisResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AiServiceError(
      "The AI response did not match the expected format."
    );
  }

  return parsed.data;
}
