import Link from "next/link";
import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AiInsightBadge } from "@/components/ai/ai-insight-badge";
import {
  logAnalysisResultSchema,
  projectReportResultSchema,
} from "@/lib/validations/ai";
import type { DashboardInsight } from "@/app/actions/dashboard";

/**
 * Insight content is validated JSON (docs/PRD.md #8), but it's
 * re-validated here rather than trusted blindly before rendering —
 * consistent with how every other AI-output component in this codebase
 * (e.g. project-report-card.tsx) treats stored `content`.
 */
function extractSummary(insight: DashboardInsight): string | null {
  if (insight.type === "report") {
    const parsed = projectReportResultSchema.safeParse(insight.content);
    return parsed.success ? parsed.data.progressSummary : null;
  }

  const parsed = logAnalysisResultSchema.safeParse(insight.content);
  return parsed.success ? parsed.data.summary : null;
}

function LatestInsightCard({ insight }: { insight: DashboardInsight | null }) {
  if (!insight) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest AI insight</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Sparkles}
            title="No AI insights yet"
            description="Generate a development log analysis or project report from a project page to see it here."
          />
        </CardContent>
      </Card>
    );
  }

  const summary = extractSummary(insight);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Latest AI insight</CardTitle>
        <AiInsightBadge />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-foreground">
          {summary ?? "This insight could not be displayed."}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/dashboard/projects/${insight.projectId}`}
            className="text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {insight.projectName}
          </Link>
          <span className="font-mono text-xs text-muted-foreground">
            {new Date(insight.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export { LatestInsightCard };
