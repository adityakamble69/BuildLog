"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { devLogs, type DevLog } from "@/lib/db/schema/dev-logs";
import { requireUserId } from "@/lib/auth/current-user";
import { getProjectById } from "@/app/actions/projects";
import { recordActivity } from "@/app/actions/activity";
import {
  createDevLogSchema,
  devLogIdSchema,
  updateDevLogSchema,
} from "@/lib/validations/dev-logs";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getDevLogsByProject(projectId: string): Promise<DevLog[]> {
  const project = await getProjectById(projectId);
  if (!project) return [];

  return db
    .select()
    .from(devLogs)
    .where(eq(devLogs.projectId, projectId))
    .orderBy(desc(devLogs.createdAt));
}

export async function createDevLog(input: unknown): Promise<ActionResult<DevLog>> {
  const userId = await requireUserId();

  const parsed = createDevLogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const project = await getProjectById(parsed.data.projectId);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  const [log] = await db
    .insert(devLogs)
    .values({
      projectId: parsed.data.projectId,
      userId,
      content: parsed.data.content,
    })
    .returning();

  await recordActivity(parsed.data.projectId, userId, "dev_log_added", {
    devLogId: log.id,
  });

  revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);

  return { success: true, data: log };
}

export async function updateDevLog(input: unknown): Promise<ActionResult<DevLog>> {
  const userId = await requireUserId();

  const parsed = updateDevLogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // dev_logs carries its own user_id (docs/database.md), so ownership can
  // be checked directly rather than via a project lookup.
  const [log] = await db
    .update(devLogs)
    .set({ content: parsed.data.content, updatedAt: new Date() })
    .where(and(eq(devLogs.id, parsed.data.id), eq(devLogs.userId, userId)))
    .returning();

  if (!log) {
    return { success: false, error: "Log entry not found." };
  }

  revalidatePath(`/dashboard/projects/${log.projectId}`);

  return { success: true, data: log };
}

export async function deleteDevLog(id: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const parsed = devLogIdSchema.safeParse({ id });
  if (!parsed.success) {
    return { success: false, error: "Invalid log id." };
  }

  const [deleted] = await db
    .delete(devLogs)
    .where(and(eq(devLogs.id, id), eq(devLogs.userId, userId)))
    .returning({ id: devLogs.id, projectId: devLogs.projectId });

  if (!deleted) {
    return { success: false, error: "Log entry not found." };
  }

  revalidatePath(`/dashboard/projects/${deleted.projectId}`);

  return { success: true, data: undefined };
}
