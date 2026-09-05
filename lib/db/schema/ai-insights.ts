import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";

import { projects } from "./projects";
import { devLogs } from "./dev-logs";

/**
 * ai_insights
 * Source of truth: docs/database.md
 *
 * Structured AI output (log_analysis | report). Content is stored as
 * validated/normalized JSON — never raw, untrusted model output.
 */
export const aiInsights = pgTable("ai_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  devLogId: uuid("dev_log_id").references(() => devLogs.id, {
    onDelete: "set null",
  }),
  // log_analysis | report
  type: varchar("type", { length: 30 }).notNull(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AiInsight = typeof aiInsights.$inferSelect;
export type NewAiInsight = typeof aiInsights.$inferInsert;

export const AI_INSIGHT_TYPES = ["log_analysis", "report"] as const;
export type AiInsightType = (typeof AI_INSIGHT_TYPES)[number];
