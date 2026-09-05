import { pgTable, uuid, varchar, jsonb, timestamp, index } from "drizzle-orm/pg-core";

import { projects } from "./projects";

/**
 * activity_logs
 * Source of truth: docs/database.md
 *
 * Lightweight activity trail (e.g. "task_completed") used to power
 * the dashboard's recent-activity feed.
 */
export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Per docs/database.md #9.
    index("activity_logs_project_id_created_at_idx").on(
      table.projectId,
      table.createdAt
    ),
  ]
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
