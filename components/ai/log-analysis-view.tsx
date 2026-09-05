import { AiInsightBadge } from "@/components/ai/ai-insight-badge";
import { Badge } from "@/components/ui/badge";
import type { LogAnalysisResult } from "@/lib/validations/ai";

function LogAnalysisView({ result }: { result: LogAnalysisResult }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <AiInsightBadge />
      </div>

      <p className="text-sm text-foreground">{result.summary}</p>

      {result.topics.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {result.topics.map((topic) => (
            <Badge key={topic} variant="outline">
              {topic}
            </Badge>
          ))}
        </div>
      ) : null}

      {result.blockers.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">
            Possible blockers
          </p>
          <ul className="flex flex-col gap-1 text-sm text-foreground">
            {result.blockers.map((blocker, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-warning">•</span>
                {blocker}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.nextActions.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">
            Suggested next actions
          </p>
          <ul className="flex flex-col gap-1 text-sm text-foreground">
            {result.nextActions.map((action, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export { LogAnalysisView };
