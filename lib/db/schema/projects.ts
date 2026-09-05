import { pgTable, uuid, varchar, text, timestamp, bigint, index } from "drizzle-orm/pg-core";
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
    // Repository metadata is copied from GitHub only after the owner has
    // explicitly linked a repository to this project. OAuth credentials
    // remain in github_connections and never reach this table or the client.
    githubRepositoryId: bigint("github_repository_id", { mode: "number" }),
    githubRepositoryOwner: varchar("github_repository_owner", { length: 255 }),
    githubRepositoryName: varchar("github_repository_name", { length: 255 }),
    githubRepositoryUrl: text("github_repository_url"),
    githubDefaultBranch: varchar("github_default_branch", { length: 255 }),
    githubLastSyncedAt: timestamp("github_last_synced_at", {
      withTimezone: true,
    }),
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
    index("projects_user_github_repository_idx").on(
      table.userId,
      table.githubRepositoryId
    ),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const PROJECT_STATUSES = ["active", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
