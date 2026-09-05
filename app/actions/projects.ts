"use server";

import { and, arrayContains, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { projects, type Project } from "@/lib/db/schema/projects";
import { requireUserId } from "@/lib/auth/current-user";
import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from "@/lib/validations/projects";

/**
 * Per docs/rules.md #7/#9/#10: every action here re-derives identity
 * server-side via requireUserId() and re-checks ownership on every
 * read/write — a project id in a form or URL is never sufficient proof
 * of ownership on its own.
 */

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/** All projects owned by the current user, newest first, optionally filtered by tag. */
export async function getProjects(tag?: string): Promise<Project[]> {
  const userId = await requireUserId();

  return db
    .select()
    .from(projects)
    .where(
      tag
        ? and(eq(projects.userId, userId), arrayContains(projects.tags, [tag]))
        : eq(projects.userId, userId)
    )
    .orderBy(desc(projects.createdAt));
}

/** Distinct tags across all of the current user's projects, alphabetically — for filter UI. */
export async function getAllProjectTags(): Promise<string[]> {
  const userProjects = await getProjects();
  const tags = new Set<string>();
  for (const project of userProjects) {
    for (const tag of project.tags) tags.add(tag);
  }
  return [...tags].sort();
}

/** A single project, scoped to the current user. Returns null if not found/owned. */
export async function getProjectById(id: string): Promise<Project | null> {
  const userId = await requireUserId();
  const parsed = projectIdSchema.safeParse({ id });
  if (!parsed.success) return null;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);

  return project ?? null;
}

export async function createProject(
  input: unknown
): Promise<ActionResult<Project>> {
  const userId = await requireUserId();

  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const [project] = await db
    .insert(projects)
    .values({
      userId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      tags: parsed.data.tags,
    })
    .returning();

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");

  return { success: true, data: project };
}

export async function updateProject(
  input: unknown
): Promise<ActionResult<Project>> {
  const userId = await requireUserId();

  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Ownership check: the WHERE clause requires user_id to match, so a
  // non-owner's update simply matches zero rows instead of touching
  // someone else's project.
  const [project] = await db
    .update(projects)
    .set({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      tags: parsed.data.tags,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, parsed.data.id), eq(projects.userId, userId)))
    .returning();

  if (!project) {
    return { success: false, error: "Project not found." };
  }

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${parsed.data.id}`);
  revalidatePath("/dashboard");

  return { success: true, data: project };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const parsed = projectIdSchema.safeParse({ id });
  if (!parsed.success) {
    return { success: false, error: "Invalid project id." };
  }

  const [deleted] = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning({ id: projects.id });

  if (!deleted) {
    return { success: false, error: "Project not found." };
  }

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}
