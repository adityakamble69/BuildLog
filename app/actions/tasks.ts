"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { tasks, type Task } from "@/lib/db/schema/tasks";
import { requireUserId } from "@/lib/auth/current-user";
import { getProjectById } from "@/app/actions/projects";
import { recordActivity } from "@/app/actions/activity";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/lib/validations/tasks";

/**
 * Tasks have no user_id column of their own — ownership is inherited
 * from the parent project (docs/database.md). Every action here goes
 * through getProjectById(), which already scopes by the authenticated
 * user, before touching a task. A project id from a form/URL is never
 * trusted on its own (docs/rules.md #9/#10).
 */

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const project = await getProjectById(projectId);
  if (!project) return [];

  return db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.createdAt));
}

export async function createTask(input: unknown): Promise<ActionResult<Task>> {
  const userId = await requireUserId();

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const project = await getProjectById(parsed.data.projectId);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  const [task] = await db
    .insert(tasks)
    .values({
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ?? null,
    })
    .returning();

  await recordActivity(parsed.data.projectId, userId, "task_created", {
    taskId: task.id,
    title: task.title,
  });

  revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);

  return { success: true, data: task };
}

export async function updateTask(input: unknown): Promise<ActionResult<Task>> {
  const userId = await requireUserId();

  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const project = await getProjectById(parsed.data.projectId);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  const [existing] = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(and(eq(tasks.id, parsed.data.id), eq(tasks.projectId, parsed.data.projectId)))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Task not found." };
  }

  const [task] = await db
    .update(tasks)
    .set({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, parsed.data.id), eq(tasks.projectId, parsed.data.projectId)))
    .returning();

  if (existing.status !== parsed.data.status) {
    await recordActivity(
      parsed.data.projectId,
      userId,
      parsed.data.status === "done" ? "task_completed" : "task_status_changed",
      { taskId: task.id, title: task.title, from: existing.status, to: task.status }
    );
  }

  revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);

  return { success: true, data: task };
}

export async function updateTaskStatus(input: unknown): Promise<ActionResult<Task>> {
  const userId = await requireUserId();

  const parsed = updateTaskStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const [existing] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, parsed.data.id))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Task not found." };
  }

  // Ownership is enforced through the parent project, not the task row.
  const project = await getProjectById(existing.projectId);
  if (!project) {
    return { success: false, error: "Task not found." };
  }

  const [task] = await db
    .update(tasks)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(tasks.id, parsed.data.id))
    .returning();

  if (existing.status !== parsed.data.status) {
    await recordActivity(
      existing.projectId,
      userId,
      parsed.data.status === "done" ? "task_completed" : "task_status_changed",
      { taskId: task.id, title: task.title, from: existing.status, to: task.status }
    );
  }

  revalidatePath(`/dashboard/projects/${existing.projectId}`);

  return { success: true, data: task };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const parsed = taskIdSchema.safeParse({ id });
  if (!parsed.success) {
    return { success: false, error: "Invalid task id." };
  }

  const [existing] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Task not found." };
  }

  const project = await getProjectById(existing.projectId);
  if (!project) {
    return { success: false, error: "Task not found." };
  }

  await db.delete(tasks).where(eq(tasks.id, id));

  await recordActivity(existing.projectId, userId, "task_deleted", {
    taskId: existing.id,
    title: existing.title,
  });

  revalidatePath(`/dashboard/projects/${existing.projectId}`);

  return { success: true, data: undefined };
}
