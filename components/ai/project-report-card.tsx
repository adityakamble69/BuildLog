"use client";

import * as React from "react";
import { RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiInsightBadge } from "@/components/ai/ai-insight-badge";
import { ProjectReportView } from "@/components/ai/project-report-view";
import { generateProjectReport } from "@/app/actions/ai";
import { projectReportResultSchema } from "@/lib/validations/ai";
import type { AiInsight } from "@/lib/db/schema/ai-insights";

/**
 * Project-level AI report (docs/PRD.md #7.6). Generated on demand, not on
 * every page load, per docs/rules.md #18.
 */
function ProjectReportCard({
  projectId,
  initialInsight,
}: {
  projectId: string;
  initialInsight: AiInsight | null;
}) {
  const initialParsed = initialInsight
    ? projectReportResultSchema.safeParse(initialInsight.content)
    : null;

  const [result, setResult] = React.useState(
    initialParsed?.success ? initialParsed.data : null
  );
  const [generatedAt, setGeneratedAt] = React.useState<Date | null>(
    initialInsight ? new Date(initialInsight.createdAt) : null
  );
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setIsPending(true);
    const response = await generateProjectReport(projectId);
    setIsPending(false);

    if (!response.success) {
      setError(response.error);
      return;
    }

    const parsed = projectReportResultSchema.safeParse(response.data.content);
    if (!parsed.success) {
      setError("AI report could not be displayed.");
      return;
    }

    setResult(parsed.data);
    setGeneratedAt(new Date(response.data.createdAt));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>AI Project Report</CardTitle>
          {result ? <AiInsightBadge /> : null}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={handleGenerate}
        >
          {result ? (
            <RefreshCw className={isPending ? "size-3.5 animate-spin" : "size-3.5"} />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {isPending ? "Generating…" : result ? "Regenerate" : "Generate report"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}

        {result ? (
          <>
            <ProjectReportView result={result} />
            {generatedAt ? (
              <p className="font-mono text-xs text-muted-foreground">
                Generated{" "}
                {generatedAt.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Generate a report to get a progress summary, accomplishments,
            possible blockers, and recommended next steps based on this
            project&apos;s tasks and development log.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export { ProjectReportCard };
