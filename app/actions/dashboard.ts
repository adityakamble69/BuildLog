"use server";

import { desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { projects, type Project } from "@/lib/db/schema/projects";
import { tasks } from "@/lib/db/schema/tasks";
import { devLogs } from "@/lib/db/schema/dev-logs";
import { activityLogs, type ActivityLog } from "@/lib/db/schema/activity-logs";
import { aiInsights, type AiInsight } from "@/lib/db/schema/ai-insights";
import { requireUserId } from "@/lib/auth/current-user";
import { getProjects } from "@/app/actions/projects";
import {
  calculateShipScore,
  getShipScoreStatus,
  type ShipScoreResult,
  type ShipScoreStatus,
} from "@/lib/utils/ship-score";
import { calculateStreaks, type StreakStats } from "@/lib/utils/streaks";

/**
 * Dashboard overview (docs/phases.md Phase 7, docs/PRD.md #7.7/#7.8).
 *
 * getProjects() already scopes to the authenticated user, so every id
 * that flows into the batch queries below came from a row the user
 * already owns — the queries here are for efficiency (one grouped query
 * per table instead of one query per project), not for authorization.
 * The activity/insight queries still join back through projects.user_id
 * as a second, independent check.
 */

export type ProjectWithShipScore = {
  project: Project;
  taskStats: { total: number; completed: number };
  shipScore: ShipScoreResult;
  status: ShipScoreStatus;
};

export type DashboardActivityEntry = ActivityLog & { projectName: string };
export type DashboardInsight = AiInsight & { projectName: string };

export type DashboardOverview = {
  projects: ProjectWithShipScore[];
  stats: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
  };
  streaks: StreakStats;
  activityTimestamps: string[];
  recentActivity: DashboardActivityEntry[];
  latestInsight: DashboardInsight | null;
};

async function getTaskStatsByProjectIds(
  projectIds: string[]
): Promise<Map<string, { total: number; completed: number }>> {
  const stats = new Map<string, { total: number; completed: number }>();
  if (projectIds.length === 0) return stats;

  const rows = await db
    .select({
      projectId: tasks.projectId,
      total: sql<number>`count(*)`,
      completed: sql<number>`count(*) filter (where ${tasks.status} = 'done')`,
    })
    .from(tasks)
    .where(inArray(tasks.projectId, projectIds))
    .groupBy(tasks.projectId);

  for (const row of rows) {
    stats.set(row.projectId, {
      total: Number(row.total),
      completed: Number(row.completed),
    });
  }
  return stats;
}

async function getDevLogCountsByProjectIds(
  projectIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (projectIds.length === 0) return counts;

  const rows = await db
    .select({
      projectId: devLogs.projectId,
      total: sql<number>`count(*)`,
    })
    .from(devLogs)
    .where(inArray(devLogs.projectId, projectIds))
    .groupBy(devLogs.projectId);

  for (const row of rows) {
    counts.set(row.projectId, Number(row.total));
  }
  return counts;
}

async function getLastActivityByProjectIds(
  projectIds: string[]
): Promise<Map<string, Date>> {
  const lastActivity = new Map<string, Date>();
  if (projectIds.length === 0) return lastActivity;

  const rows = await db
    .select({
      projectId: activityLogs.projectId,
      lastActivityAt: sql<Date>`max(${activityLogs.createdAt})`,
    })
    .from(activityLogs)
    .where(inArray(activityLogs.projectId, projectIds))
    .groupBy(activityLogs.projectId);

  for (const row of rows) {
    lastActivity.set(row.projectId, new Date(row.lastActivityAt));
  }
  return lastActivity;
}

/** Everything the dashboard needs, gathered in a fixed, small number of queries. */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const userId = await requireUserId();
  const userProjects = await getProjects();
  const projectIds = userProjects.map((p) => p.id);

  const [taskStatsMap, devLogCountsMap, lastActivityMap] = await Promise.all([
    getTaskStatsByProjectIds(projectIds),
    getDevLogCountsByProjectIds(projectIds),
    getLastActivityByProjectIds(projectIds),
  ]);

  const projectsWithShipScore: ProjectWithShipScore[] = userProjects.map(
    (project) => {
      const taskStats = taskStatsMap.get(project.id) ?? {
        total: 0,
        completed: 0,
      };
      const shipScore = calculateShipScore({
        totalTasks: taskStats.total,
        completedTasks: taskStats.completed,
        lastActivityAt: lastActivityMap.get(project.id) ?? null,
        devLogCount: devLogCountsMap.get(project.id) ?? 0,
      });

      return {
        project,
        taskStats,
        shipScore,
        status: getShipScoreStatus(shipScore),
      };
    }
  );

  const stats = {
    totalProjects: userProjects.length,
    activeProjects: userProjects.filter((p) => p.status === "active").length,
    totalTasks: [...taskStatsMap.values()].reduce((sum, s) => sum + s.total, 0),
    completedTasks: [...taskStatsMap.values()].reduce(
      (sum, s) => sum + s.completed,
      0
    ),
  };

  const recentActivity: DashboardActivityEntry[] =
    projectIds.length === 0
      ? []
      : await db
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
          .where(eq(projects.userId, userId))
          .orderBy(desc(activityLogs.createdAt))
          .limit(8);

  const latestInsightRows: DashboardInsight[] =
    projectIds.length === 0
      ? []
      : await db
          .select({
            id: aiInsights.id,
            projectId: aiInsights.projectId,
            devLogId: aiInsights.devLogId,
            type: aiInsights.type,
            content: aiInsights.content,
            createdAt: aiInsights.createdAt,
            projectName: projects.name,
          })
          .from(aiInsights)
          .innerJoin(projects, eq(projects.id, aiInsights.projectId))
  const streakActivityDates =
    projectIds.length === 0
      ? []
      : await db
          .select({ createdAt: activityLogs.createdAt })
          .from(activityLogs)
          .innerJoin(projects, eq(projects.id, activityLogs.projectId))
          .where(eq(projects.userId, userId))
          .orderBy(desc(activityLogs.createdAt))
          .limit(100);

  const streaks = calculateStreaks(
    streakActivityDates.map((entry) => entry.createdAt)
  );

  return {
    projects: projectsWithShipScore,
    stats,
    streaks,
    activityTimestamps: streakActivityDates.map((a) =>
      typeof a.createdAt === "string" ? a.createdAt : a.createdAt.toISOString()
    ),
    recentActivity,
    latestInsight: latestInsightRows[0] ?? null,
  };
}
