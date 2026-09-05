"use client";

import * as React from "react";
import { GraduationCap, Lightbulb, GitBranch, BookmarkCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiInsightBadge } from "@/components/ai/ai-insight-badge";
import { generateLearningSummary } from "@/app/actions/ai";
import {
  learningSummaryResultSchema,
  type LearningSummaryResult,
} from "@/lib/validations/ai";
import type { AiInsight } from "@/lib/db/schema/ai-insights";

function SectionList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <ul className="flex flex-col gap-1.5 text-sm text-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LearningSummaryCard({
  projectId,
  initialInsight,
}: {
  projectId: string;
  initialInsight: AiInsight | null;
}) {
  const initialParsed = initialInsight
    ? learningSummaryResultSchema.safeParse(initialInsight.content)
    : null;

  const [result, setResult] = React.useState<LearningSummaryResult | null>(
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
    const response = await generateLearningSummary(projectId);
    setIsPending(false);

    if (!response.success) {
      setError(response.error);
      return;
    }

    const parsed = learningSummaryResultSchema.safeParse(response.data.content);
    if (!parsed.success) {
      setError("Learning summary could not be displayed.");
      return;
    }

    setResult(parsed.data);
    setGeneratedAt(new Date(response.data.createdAt));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" />
            <CardTitle>Learnings & Insights</CardTitle>
          </div>
          {result ? <AiInsightBadge /> : null}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={handleGenerate}
        >
          {result ? (
            <RefreshCw
              className={isPending ? "size-3.5 animate-spin" : "size-3.5"}
            />
          ) : (
            <Lightbulb className="size-3.5" />
          )}
          {isPending ? "Analyzing…" : result ? "Update" : "Synthesize learnings"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3.5">
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-foreground">{result.overview}</p>

            <SectionList
              title="Key Technical Learnings"
              icon={<Lightbulb className="size-3.5 text-amber-500" />}
              items={result.keyLearnings}
            />

            <SectionList
              title="Architectural & Design Decisions"
              icon={<GitBranch className="size-3.5 text-primary" />}
              items={result.decisions}
            />

            <SectionList
              title="Reusable Patterns & Tips"
              icon={<BookmarkCheck className="size-3.5 text-success" />}
              items={result.patternsAndTips}
            />

            {generatedAt ? (
              <p className="font-mono text-xs text-muted-foreground border-t border-border/50 pt-2">
                Synthesized{" "}
                {generatedAt.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Synthesize key technical takeaways, decisions, and patterns discovered
            across this project&apos;s development logs.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
