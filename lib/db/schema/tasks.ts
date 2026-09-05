import { pgTable, uuid, varchar, text, date, timestamp } from "drizzle-orm/pg-core";

import { projects } from "./projects";

/**
 * tasks
 * Source of truth: docs/database.md
 *
 * Belongs to a project. Ownership is enforced by verifying the parent
 * project's user_id, not by a task-level user_id column.
 */
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  // todo | in_progress | done
  status: varchar("status", { length: 20 }).notNull().default("todo"),
  // low | medium | high
  priority: varchar("priority", { length: 10 }).notNull().default("medium"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
