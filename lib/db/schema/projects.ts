import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * projects
 * Source of truth: docs/database.md
 *
 * Ownership boundary: user_id (Clerk user ID).
 * Projects are the primary authorization boundary — tasks, dev logs,
 * ai_insights, and activity_logs all inherit authorization through
 * their project_id.
 */
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    // active | completed | archived
    status: varchar("status", { length: 20 }).notNull().default("active"),
    // Free-form labels for categorizing a project (e.g. "frontend",
    // "side-project"). Stored as a Postgres text[] rather than a join
    // table — tags here are per-project labels, not a shared/reusable
    // taxonomy, so normalization would add complexity without benefit.
    tags: varchar("tags", { length: 30 })
      .array()
      .notNull()
      .default(sql`'{}'::varchar[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Per docs/database.md #9: supports "find my projects" and
    // status-filtered dashboard/list queries.
    index("projects_user_id_idx").on(table.userId),
    index("projects_user_id_status_idx").on(table.userId, table.status),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const PROJECT_STATUSES = ["active", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
