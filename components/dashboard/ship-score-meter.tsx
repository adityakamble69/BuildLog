import { cn } from "@/lib/utils";
import { ProjectHealthBadge } from "@/components/dashboard/project-health-badge";
import type { ShipScoreResult, ShipScoreStatus } from "@/lib/utils/ship-score";

/**
 * Renders the Ship Score as a number + bar, with the factor breakdown
 * shown underneath so the score is never a black box (docs/PRD.md #7.8).
 */
function ShipScoreMeter({
  shipScore,
  status,
  showBreakdown = true,
  className,
}: {
  shipScore: ShipScoreResult;
  status: ShipScoreStatus;
  showBreakdown?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ship Score</span>
          <ProjectHealthBadge status={status} />
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
          {shipScore.score}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={shipScore.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Ship Score"
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-200"
          style={{ width: `${shipScore.score}%` }}
        />
      </div>

      {showBreakdown ? (
        <ul className="flex flex-col gap-1.5">
          {shipScore.factors.map((factor) => (
            <li
              key={factor.label}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-muted-foreground">{factor.detail}</span>
              <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                {factor.points}/{factor.maxPoints}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { ShipScoreMeter };
