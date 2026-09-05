"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogAnalysisView } from "@/components/ai/log-analysis-view";
import { generateLogAnalysis } from "@/app/actions/ai";
import { logAnalysisResultSchema } from "@/lib/validations/ai";
import type { AiInsight } from "@/lib/db/schema/ai-insights";

/**
 * Per-dev-log AI analysis (docs/PRD.md #7.5). Analysis runs on demand
 * rather than automatically on every log, per docs/rules.md #18 (avoid
 * expensive AI calls on every page load/action).
 */
function LogAnalysisPanel({
  devLogId,
  initialInsight,
}: {
  devLogId: string;
  initialInsight: AiInsight | null;
}) {
  const initialParsed = initialInsight
    ? logAnalysisResultSchema.safeParse(initialInsight.content)
    : null;

  const [result, setResult] = React.useState(
    initialParsed?.success ? initialParsed.data : null
  );
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleAnalyze() {
    setError(null);
    setIsPending(true);
    const response = await generateLogAnalysis(devLogId);
    setIsPending(false);

    if (!response.success) {
      setError(response.error);
      return;
    }

    const parsed = logAnalysisResultSchema.safeParse(response.data.content);
    if (!parsed.success) {
      setError("AI analysis could not be displayed.");
      return;
    }

    setResult(parsed.data);
  }

  if (result) {
    return (
      <div className="mt-2">
        <LogAnalysisView result={result} />
      </div>
    );
  }

  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit text-muted-foreground"
        disabled={isPending}
        onClick={handleAnalyze}
      >
        <Sparkles className="size-3.5" />
        {isPending ? "Analyzing…" : "Analyze with AI"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { LogAnalysisPanel };
