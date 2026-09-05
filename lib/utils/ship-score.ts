/**
 * Ship Score (docs/PRD.md #7.8, docs/phases.md Phase 7).
 *
 * "A simple readiness indicator based on measurable project information
 * ... must remain understandable and should not pretend to be a
 * scientific measurement." This is three plain point totals — task
 * completion, recent development activity, and documentation — added
 * together to 100. Every point awarded is explained in `factors` so the
 * number is never a black box.
 *
 * Pure and DB-free on purpose: callers assemble a `ShipScoreInput` from
 * whatever data they already have (a project detail page's in-memory
 * arrays, or a batch dashboard query's aggregates) and this module never
 * touches the database itself.
 */

export type ShipScoreFactor = {
  label: string;
  points: number;
  maxPoints: number;
  detail: string;
};

export type ShipScoreResult = {
  /** 0–100. */
  score: number;
  factors: ShipScoreFactor[];
  /** True when there's essentially no data yet to score — a fresh project. */
  isNewProject: boolean;
};

export type ShipScoreInput = {
  totalTasks: number;
  completedTasks: number;
  /** Timestamp of the most recent activity_logs entry for the project, if any. */
  lastActivityAt: Date | string | null;
  devLogCount: number;
};

const TASK_COMPLETION_MAX = 50;
const RECENT_ACTIVITY_MAX = 30;
const DOCUMENTATION_MAX = 20;

function daysSince(date: Date | string | null): number | null {
  if (!date) return null;
  const then = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - then.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function taskCompletionFactor(
  totalTasks: number,
  completedTasks: number
): ShipScoreFactor {
  if (totalTasks === 0) {
    return {
      label: "Task completion",
      points: 0,
      maxPoints: TASK_COMPLETION_MAX,
      detail: "No tasks yet.",
    };
  }

  const percent = completedTasks / totalTasks;
  return {
    label: "Task completion",
    points: Math.round(percent * TASK_COMPLETION_MAX),
    maxPoints: TASK_COMPLETION_MAX,
    detail: `${completedTasks} / ${totalTasks} tasks done (${Math.round(
      percent * 100
    )}%).`,
  };
}

function recentActivityFactor(
  lastActivityAt: Date | string | null
): ShipScoreFactor {
  const days = daysSince(lastActivityAt);

  if (days === null) {
    return {
      label: "Recent activity",
      points: 0,
      maxPoints: RECENT_ACTIVITY_MAX,
      detail: "No recorded activity yet.",
    };
  }

  let points: number;
  if (days <= 1) points = RECENT_ACTIVITY_MAX;
  else if (days <= 3) points = 24;
  else if (days <= 7) points = 18;
  else if (days <= 14) points = 10;
  else if (days <= 30) points = 4;
  else points = 0;

  return {
    label: "Recent activity",
    points,
    maxPoints: RECENT_ACTIVITY_MAX,
    detail:
      days === 0
        ? "Last activity was today."
        : `Last activity was ${days} day${days === 1 ? "" : "s"} ago.`,
  };
}

function documentationFactor(devLogCount: number): ShipScoreFactor {
  let points: number;
  if (devLogCount === 0) points = 0;
  else if (devLogCount <= 2) points = 8;
  else if (devLogCount <= 5) points = 14;
  else points = DOCUMENTATION_MAX;

  return {
    label: "Documentation",
    points,
    maxPoints: DOCUMENTATION_MAX,
    detail:
      devLogCount === 0
        ? "No development log entries yet."
        : `${devLogCount} development log ${
            devLogCount === 1 ? "entry" : "entries"
          }.`,
  };
}

export function calculateShipScore(input: ShipScoreInput): ShipScoreResult {
  const factors = [
    taskCompletionFactor(input.totalTasks, input.completedTasks),
    recentActivityFactor(input.lastActivityAt),
    documentationFactor(input.devLogCount),
  ];

  const score = factors.reduce((sum, factor) => sum + factor.points, 0);
  const isNewProject =
    input.totalTasks === 0 &&
    input.devLogCount === 0 &&
    input.lastActivityAt === null;

  return { score, factors, isNewProject };
}

/**
 * Builds a ShipScoreInput from data a page has already loaded (e.g. the
 * project detail page's tasks/activity/dev-log arrays), so callers with
 * in-memory data don't need a second aggregate query.
 *
 * `activity` must already be ordered newest-first (every activity query
 * in this codebase is) — only the first entry's timestamp is used.
 */
export function shipScoreInputFromCollections(params: {
  tasks: { status: string }[];
  activity: { createdAt: Date | string }[];
  devLogs: unknown[];
}): ShipScoreInput {
  return {
    totalTasks: params.tasks.length,
    completedTasks: params.tasks.filter((t) => t.status === "done").length,
    lastActivityAt: params.activity[0]?.createdAt ?? null,
    devLogCount: params.devLogs.length,
  };
}

export type ShipScoreStatus = {
  label: string;
  variant: "success" | "warning" | "destructive" | "info";
};

/** Understandable bands, not a claim of precision — see module docstring. */
export function getShipScoreStatus(result: ShipScoreResult): ShipScoreStatus {
  if (result.isNewProject) {
    return { label: "Just started", variant: "info" };
  }
  if (result.score >= 70) return { label: "On track", variant: "success" };
  if (result.score >= 40) return { label: "Needs attention", variant: "warning" };
  return { label: "At risk", variant: "destructive" };
}
