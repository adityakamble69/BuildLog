"use server";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { activityLogs, type ActivityLog } from "@/lib/db/schema/activity-logs";
import { projects } from "@/lib/db/schema/projects";
import { requireUserId } from "@/lib/auth/current-user";

export type UserActivityEntry = ActivityLog & { projectName: string };

/**
 * Lightweight activity trail (docs/database.md, docs/phases.md Phase 5).
 * Not a public API surface on its own — recordActivity() is called from
 * inside the tasks/dev-logs actions after a mutation succeeds, using the
 * same userId those actions already verified.
 */
export async function recordActivity(
  projectId: string,
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await db.insert(activityLogs).values({
    projectId,
    userId,
    action,
    metadata: metadata ?? null,
  });
}

/**
 * Recent activity for a project, newest first. Ownership is enforced by
 * joining through projects.user_id — a project id alone is not enough.
 */
export async function getRecentActivity(
  projectId: string,
  limit = 8
): Promise<ActivityLog[]> {
  const userId = await requireUserId();

  return db
    .select({
      id: activityLogs.id,
      projectId: activityLogs.projectId,
      userId: activityLogs.userId,
      action: activityLogs.action,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .innerJoin(projects, eq(projects.id, activityLogs.projectId))
    .where(and(eq(activityLogs.projectId, projectId), eq(projects.userId, userId)))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

/**
 * Full cross-project activity feed for the dedicated /dashboard/activity
 * page. Same ownership join as getRecentActivity, just not scoped to a
 * single project and with pagination/filters instead of a fixed small limit.
 */
export async function getAllActivity(
  limit = 30,
  offset = 0,
  filters?: { projectId?: string; action?: string }
): Promise<UserActivityEntry[]> {
  const userId = await requireUserId();

  const conditions = [eq(projects.userId, userId)];
  if (filters?.projectId) {
    conditions.push(eq(activityLogs.projectId, filters.projectId));
  }
  if (filters?.action) {
    conditions.push(eq(activityLogs.action, filters.action));
  }

  return db
    .select({
      id: activityLogs.id,
      projectId: activityLogs.projectId,
      userId: activityLogs.userId,
      action: activityLogs.action,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
      projectName: projects.name,
    })
    .from(activityLogs)
    .innerJoin(projects, eq(projects.id, activityLogs.projectId))
    .where(and(...conditions))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)
    .offset(offset);
}
