import { Badge } from "@/components/ui/badge";

const LOG_LINES = [
  { time: "08:14", entry: "Wired Clerk middleware to protect /dashboard" },
  { time: "09:02", entry: "Fixed cascade delete on tasks → projects" },
  { time: "10:47", entry: "AI summary: 3 blockers resolved, 1 open" },
] as const;

const SHIP_SCORE = 74;

/**
 * A static preview of what using BuildLog actually looks like: a
 * timestamped log, real project status, and the Ship Score readout.
 * This stands in for a generic feature-icon grid in the hero — the
 * product's own primary artifact (the dev log) is the demo.
 */
function LogPanelPreview() {
  return (
    <div className="w-full rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-xs text-muted-foreground">
          api-gateway
        </span>
        <Badge variant="success" className="font-mono text-[11px]">
          active
        </Badge>
      </div>

      <div className="flex flex-col gap-2.5 px-4 py-4">
        {LOG_LINES.map((line) => (
          <div key={line.time} className="flex gap-3 text-sm">
            <span className="shrink-0 font-mono text-xs text-muted-foreground/80 tabular-nums">
              {line.time}
            </span>
            <span className="text-foreground/90">{line.entry}</span>
          </div>
        ))}
        <div className="flex gap-3 text-sm">
          <span className="shrink-0 font-mono text-xs text-muted-foreground/80 tabular-nums">
            now
          </span>
          <span
            aria-hidden="true"
            className="animate-caret-blink inline-block h-3.5 w-1.5 translate-y-0.5 bg-muted-foreground/60"
          />
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-muted-foreground">Ship Score</span>
          <span className="font-mono tabular-nums text-foreground">
            {SHIP_SCORE}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${SHIP_SCORE}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export { LogPanelPreview };
