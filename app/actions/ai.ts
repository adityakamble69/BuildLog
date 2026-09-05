"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { aiInsights, type AiInsight } from "@/lib/db/schema/ai-insights";
import { devLogs } from "@/lib/db/schema/dev-logs";
import { tasks } from "@/lib/db/schema/tasks";
import { requireUserId } from "@/lib/auth/current-user";
import { getProjectById } from "@/app/actions/projects";
import { analyzeDevLog } from "@/lib/ai/log-analysis";
import { generateProjectReport as runProjectReport } from "@/lib/ai/project-report";
import { generateLearningSummary as runLearningSummary } from "@/lib/ai/learning-summary";
import { AiServiceError } from "@/lib/ai/client";
import {
  devLogAnalysisRequestSchema,
  projectReportRequestSchema,
} from "@/lib/validations/ai";

/**
 * AI features (docs/phases.md Phase 6, docs/PRD.md #7.5/#7.6).
 *
 * Every action here re-derives identity via requireUserId() and re-checks
 * project/log ownership before doing anything AI- or database-related — an
 * id from the client is never trusted on its own (docs/rules.md #9/#10).
 *
 * AI failures are caught here and turned into a plain ActionResult error;
 * they never throw past this boundary and never leave partial/misleading
 * database state (docs/PRD.md #8, docs/rules.md #12).
 */

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function messageForUnknownError(error: unknown, fallback: string): string {
  if (error instanceof AiServiceError) {
    return error.message;
  }
  return fallback;
}

/** Most recent `log_analysis` insight for a specific dev log, if any. */
export async function getLogAnalysis(
  devLogId: string
): Promise<AiInsight | null> {
  const userId = await requireUserId();

  const parsed = devLogAnalysisRequestSchema.safeParse({ devLogId });
  if (!parsed.success) return null;

  // Ownership: the dev log must belong to the current user, and (belt and
  // braces) the insight must belong to that same log.
  const [log] = await db
    .select({ id: devLogs.id, userId: devLogs.userId })
    .from(devLogs)
    .where(eq(devLogs.id, parsed.data.devLogId));

  if (!log || log.userId !== userId) return null;

  const [insight] = await db
    .select()
    .from(aiInsights)
    .where(
      and(
        eq(aiInsights.devLogId, parsed.data.devLogId),
        eq(aiInsights.type, "log_analysis")
      )
    )
    .orderBy(desc(aiInsights.createdAt))
    .limit(1);

  return insight ?? null;
}

/**
 * Most recent `log_analysis` insight per dev log, for every log in a
 * project, in a single query — avoids one round-trip per log entry when
 * rendering a project's development log list.
 */
export async function getLogAnalysesByProject(
  projectId: string
): Promise<Map<string, AiInsight>> {
  const project = await getProjectById(projectId);
  if (!project) return new Map();

  const rows = await db
    .select()
    .from(aiInsights)
    .where(
      and(eq(aiInsights.projectId, projectId), eq(aiInsights.type, "log_analysis"))
    )
    .orderBy(desc(aiInsights.createdAt));

  const byDevLogId = new Map<string, AiInsight>();
  for (const row of rows) {
    // Rows are newest-first, and a dev log is analyzed on demand (not
    // re-analyzed automatically), so the first row seen per devLogId is
    // already the latest — later duplicates for the same log are skipped.
    if (row.devLogId && !byDevLogId.has(row.devLogId)) {
      byDevLogId.set(row.devLogId, row);
    }
  }

  return byDevLogId;
}

/** Generates and stores an AI analysis of a single development log entry. */
export async function generateLogAnalysis(
  devLogId: string
): Promise<ActionResult<AiInsight>> {
  const userId = await requireUserId();

  const parsed = devLogAnalysisRequestSchema.safeParse({ devLogId });
  if (!parsed.success) {
    return { success: false, error: "Invalid log id." };
  }

  const [log] = await db
    .select()
    .from(devLogs)
    .where(eq(devLogs.id, parsed.data.devLogId));

  if (!log || log.userId !== userId) {
    return { success: false, error: "Log entry not found." };
  }

  const project = await getProjectById(log.projectId);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  let result;
  try {
    result = await analyzeDevLog({
      projectName: project.name,
      logContent: log.content,
    });
  } catch (error) {
    return {
      success: false,
      error: messageForUnknownError(
        error,
        "AI analysis is temporarily unavailable. Please try again later."
      ),
    };
  }

  const [insight] = await db
    .insert(aiInsights)
    .values({
      projectId: project.id,
      devLogId: log.id,
      type: "log_analysis",
      content: result,
    })
    .returning();

  revalidatePath(`/dashboard/projects/${project.id}`);

  return { success: true, data: insight };
}

/** Most recent project-level `report` insight, if any. */
export async function getLatestProjectReport(
  projectId: string
): Promise<AiInsight | null> {
  const parsed = projectReportRequestSchema.safeParse({ projectId });
  if (!parsed.success) return null;

  const project = await getProjectById(parsed.data.projectId);
  if (!project) return null;

  const [insight] = await db
    .select()
    .from(aiInsights)
    .where(
      and(
        eq(aiInsights.projectId, parsed.data.projectId),
        eq(aiInsights.type, "report")
      )
    )
    .orderBy(desc(aiInsights.createdAt))
    .limit(1);

  return insight ?? null;
}

/**
 * Generates and stores an AI project report from the project's current
 * tasks and most recent development logs.
 */
export async function generateProjectReport(
  projectId: string
): Promise<ActionResult<AiInsight>> {
  const parsed = projectReportRequestSchema.safeParse({ projectId });
  if (!parsed.success) {
    return { success: false, error: "Invalid project id." };
  }

  const project = await getProjectById(parsed.data.projectId);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  const [projectTasks, recentLogs] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.projectId, project.id)),
    db
      .select()
      .from(devLogs)
      .where(eq(devLogs.projectId, project.id))
      .orderBy(desc(devLogs.createdAt))
      .limit(10),
  ]);

  let result;
  try {
    result = await runProjectReport({
      projectName: project.name,
      projectDescription: project.description,
      tasks: projectTasks,
      recentLogs,
    });
  } catch (error) {
    return {
      success: false,
      error: messageForUnknownError(
        error,
        "AI report generation is temporarily unavailable. Please try again later."
      ),
    };
  }

  const [insight] = await db
    .insert(aiInsights)
    .values({
      projectId: project.id,
      devLogId: null,
      type: "report",
      content: result,
    })
    .returning();

  revalidatePath(`/dashboard/projects/${project.id}`);

  return { success: true, data: insight };
}

/** Most recent `learning_summary` insight for a project, if any. */
export async function getLatestLearningSummary(
  projectId: string
): Promise<AiInsight | null> {
  const parsed = projectReportRequestSchema.safeParse({ projectId });
  if (!parsed.success) return null;

  const project = await getProjectById(parsed.data.projectId);
  if (!project) return null;

  const [insight] = await db
    .select()
    .from(aiInsights)
    .where(
      and(
        eq(aiInsights.projectId, project.id),
        eq(aiInsights.type, "learning_summary")
      )
    )
    .orderBy(desc(aiInsights.createdAt))
    .limit(1);

  return insight ?? null;
}

/**
 * Generates and stores an AI learning summary from the project's development logs.
 */
export async function generateLearningSummary(
  projectId: string
): Promise<ActionResult<AiInsight>> {
  const parsed = projectReportRequestSchema.safeParse({ projectId });
  if (!parsed.success) {
    return { success: false, error: "Invalid project id." };
  }

  const project = await getProjectById(parsed.data.projectId);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  const logs = await db
    .select()
    .from(devLogs)
    .where(eq(devLogs.projectId, project.id))
    .orderBy(desc(devLogs.createdAt))
    .limit(20);

  if (logs.length === 0) {
    return {
      success: false,
      error: "No development logs found. Add some dev logs before generating learnings.",
    };
  }

  let result;
  try {
    result = await runLearningSummary({
      projectName: project.name,
      projectDescription: project.description,
      logs,
    });
  } catch (error) {
    return {
      success: false,
      error: messageForUnknownError(
        error,
        "Learning summary generation is temporarily unavailable. Please try again later."
      ),
    };
  }

  const [insight] = await db
    .insert(aiInsights)
    .values({
      projectId: project.id,
      devLogId: null,
      type: "learning_summary",
      content: result,
    })
    .returning();

  revalidatePath(`/dashboard/projects/${project.id}`);

  return { success: true, data: insight };
}

