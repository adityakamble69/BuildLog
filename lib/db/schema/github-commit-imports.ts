import { pgTable, uuid, varchar, text, timestamp, bigint, index, uniqueIndex } from "drizzle-orm/pg-core";

import { projects } from "./projects";

/**
 * Records the GitHub commits already imported into a project's development
 * log. The unique project/SHA constraint makes manual syncs idempotent.
 */
export const githubCommitImports = pgTable(
  "github_commit_imports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).notNull(),
    repositoryId: bigint("repository_id", { mode: "number" }).notNull(),
    sha: varchar("sha", { length: 64 }).notNull(),
    message: text("message").notNull(),
    htmlUrl: text("html_url").notNull(),
    authorLogin: varchar("author_login", { length: 255 }),
    authorName: varchar("author_name", { length: 255 }),
    committedAt: timestamp("committed_at", { withTimezone: true }).notNull(),
    importedAt: timestamp("imported_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("github_commit_imports_project_sha_unique").on(
      table.projectId,
      table.sha
    ),
    index("github_commit_imports_project_committed_at_idx").on(
      table.projectId,
      table.committedAt
    ),
  ]
);

export type GitHubCommitImport = typeof githubCommitImports.$inferSelect;
