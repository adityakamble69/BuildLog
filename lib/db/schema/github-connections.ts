import { pgTable, uuid, varchar, text, timestamp, bigint, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * One encrypted GitHub OAuth token per DevTrace user. The plaintext token is
 * deliberately never selected for UI data and is only decrypted server-side
 * immediately before an authenticated GitHub API request.
 */
export const githubConnections = pgTable(
  "github_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    githubUserId: bigint("github_user_id", { mode: "number" }).notNull(),
    githubLogin: varchar("github_login", { length: 255 }).notNull(),
    githubName: varchar("github_name", { length: 255 }),
    githubAvatarUrl: text("github_avatar_url"),
    encryptedAccessToken: text("encrypted_access_token").notNull(),
    scopes: text("scopes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("github_connections_user_id_unique").on(table.userId)]
);

export type GitHubConnection = typeof githubConnections.$inferSelect;
