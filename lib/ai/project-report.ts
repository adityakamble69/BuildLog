import { AiServiceError, callAiForJson } from "@/lib/ai/client";
import {
  projectReportResultSchema,
  type ProjectReportResult,
} from "@/lib/validations/ai";
import type { Task } from "@/lib/db/schema/tasks";
import type { DevLog } from "@/lib/db/schema/dev-logs";

const SYSTEM_PROMPT = `You are the AI analyst embedded in DevTrace, a developer's project tracker and journal.

You will be given a project's task counts and its most recent development log entries. Base your analysis only on this information — do not invent accomplishments, blockers, or context that isn't implied by the data you're given.

Respond with a single JSON object and nothing else, matching exactly this shape:
{
  "progressSummary": string,    // 2-4 sentences on overall project progress right now
  "accomplishments": string[],  // concrete things that appear to have been completed; [] if unclear
  "blockers": string[],         // possible blockers or risks implied by the data; [] if none are evident
  "nextSteps": string[]         // concrete, prioritized next steps; [] if none are evident
}

Keep each array to at most 8 short items. Do not include markdown, headings, or any text outside the JSON object.`;

function summarizeTaskCounts(tasks: Task[]): string {
  if (tasks.length === 0) {
    return "No tasks have been created yet.";
  }

  const counts = { todo: 0, in_progress: 0, done: 0 } as Record<
    string,
    number
  >;
  for (const task of tasks) {
    counts[task.status] = (counts[task.status] ?? 0) + 1;
  }

  return `${tasks.length} total tasks — ${counts.done ?? 0} done, ${
    counts.in_progress ?? 0
  } in progress, ${counts.todo ?? 0} to do.`;
}

function summarizeRecentLogs(logs: DevLog[]): string {
  if (logs.length === 0) {
    return "No development log entries yet.";
  }

  return logs
    .map((log) => {
      const date = new Date(log.createdAt).toISOString().slice(0, 10);
      return `- (${date}) ${log.content}`;
    })
    .join("\n");
}

/**
 * Generates a project-level report (progress summary, accomplishments,
 * blockers, next steps) from real task/log data. Throws `AiServiceError`
 * on any failure — callers are responsible for degrading gracefully.
 */
export async function generateProjectReport(params: {
  projectName: string;
  projectDescription: string | null;
  tasks: Task[];
  recentLogs: DevLog[];
}): Promise<ProjectReportResult> {
  const userPrompt = [
    `Project: ${params.projectName}`,
    params.projectDescription
      ? `Description: ${params.projectDescription}`
      : null,
    "",
    `Task status: ${summarizeTaskCounts(params.tasks)}`,
    "",
    "Recent development log entries (newest first):",
    summarizeRecentLogs(params.recentLogs),
  ]
    .filter((line) => line !== null)
    .join("\n");

  const raw = await callAiForJson({ system: SYSTEM_PROMPT, user: userPrompt });

  const parsed = projectReportResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AiServiceError(
      "The AI response did not match the expected format."
    );
  }

  return parsed.data;
}
