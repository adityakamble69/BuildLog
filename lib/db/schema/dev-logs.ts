import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

import { projects } from "./projects";

/**
 * dev_logs
 * Source of truth: docs/database.md
 *
 * Development journal entries. Shown newest-first by default.
 */
export const devLogs = pgTable("dev_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type DevLog = typeof devLogs.$inferSelect;
export type NewDevLog = typeof devLogs.$inferInsert;
