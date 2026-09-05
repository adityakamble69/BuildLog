"use server";

import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema/projects";
import { tasks } from "@/lib/db/schema/tasks";
import { requireUserId } from "@/lib/auth/current-user";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "projects" | "tasks";
  href: string;
}

/**
 * Searches the authenticated user's projects and tasks for the command palette.
 * Scoped strictly by the current user's identity.
 */
export async function searchWorkspace(
  query: string
): Promise<SearchResultItem[]> {
  const userId = await requireUserId();
  const trimmed = query.trim();

  // Find matching projects owned by user
  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
    })
    .from(projects)
    .where(
      trimmed
        ? and(eq(projects.userId, userId), ilike(projects.name, `%${trimmed}%`))
        : eq(projects.userId, userId)
    )
    .orderBy(desc(projects.updatedAt))
    .limit(6);

  // Find matching tasks belonging to user's projects
  const userTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      projectId: tasks.projectId,
      projectName: projects.name,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(
      trimmed
        ? and(eq(projects.userId, userId), ilike(tasks.title, `%${trimmed}%`))
        : eq(projects.userId, userId)
    )
    .orderBy(desc(tasks.updatedAt))
    .limit(6);

  const results: SearchResultItem[] = [];

  for (const p of userProjects) {
    results.push({
      id: `p-${p.id}`,
      title: p.name,
      subtitle: `Project • ${p.status}`,
      category: "projects",
      href: `/dashboard/projects/${p.id}`,
    });
  }

  for (const t of userTasks) {
    results.push({
      id: `t-${t.id}`,
      title: t.title,
      subtitle: `${t.projectName} • ${t.status}`,
      category: "tasks",
      href: `/dashboard/projects/${t.projectId}`,
    });
  }

  return results;
}
