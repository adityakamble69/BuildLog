import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

/**
 * projects
 * Source of truth: docs/database.md
 *
 * Ownership boundary: user_id (Clerk user ID).
 * Projects are the primary authorization boundary — tasks, dev logs,
 * ai_insights, and activity_logs all inherit authorization through
 * their project_id.
 */
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  // active | completed | archived
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const PROJECT_STATUSES = ["active", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
