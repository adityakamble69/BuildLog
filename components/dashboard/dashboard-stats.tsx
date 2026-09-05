import { Card, CardContent } from "@/components/ui/card";
import type { DashboardOverview } from "@/app/actions/dashboard";

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 pt-6">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </span>
        {sublabel ? (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * Key project metrics (docs/design.md #24). Deliberately just four
 * plain counts — the same numbers a user could get by counting their
 * own projects/tasks, surfaced up front instead of buried per-project.
 */
function DashboardStats({ overview }: { overview: DashboardOverview }) {
  const { stats, projects } = overview;

  const completionPercent =
    stats.totalTasks === 0
      ? null
      : Math.round((stats.completedTasks / stats.totalTasks) * 100);

  const needsAttention = projects.filter(
    (p) => p.status.variant === "warning" || p.status.variant === "destructive"
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard
        label="Active projects"
        value={String(stats.activeProjects)}
        sublabel={`${stats.totalProjects} total`}
      />
      <StatCard
        label="Tasks completed"
        value={String(stats.completedTasks)}
        sublabel={`of ${stats.totalTasks}`}
      />
      <StatCard
        label="Completion"
        value={completionPercent === null ? "—" : `${completionPercent}%`}
        sublabel="across all projects"
      />
      <StatCard
        label="Needs attention"
        value={String(needsAttention)}
        sublabel={needsAttention === 1 ? "project" : "projects"}
      />
    </div>
  );
}

export { DashboardStats };
