import * as React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreakStats } from "@/lib/utils/streaks";

interface StreakBadgeProps {
  streaks: StreakStats;
  className?: string;
  showDetails?: boolean;
}

export function StreakBadge({
  streaks,
  className,
  showDetails = false,
}: StreakBadgeProps) {
  const { currentStreak, isActiveToday, longestStreak } = streaks;
  const isBurning = currentStreak > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        isBurning
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border bg-muted/40 text-muted-foreground",
        className
      )}
      title={`${currentStreak} day streak (Best: ${longestStreak} days)${
        isActiveToday ? " • Logged today!" : " • Log today to keep your streak!"
      }`}
    >
      <Flame
        className={cn(
          "size-3.5",
          isBurning
            ? "fill-amber-500 text-amber-500 animate-pulse"
            : "text-muted-foreground"
        )}
      />
      <span className="font-mono font-semibold">{currentStreak}</span>
      <span>{currentStreak === 1 ? "day streak" : "day streak"}</span>

      {showDetails && longestStreak > 0 ? (
        <>
          <span className="opacity-40">•</span>
          <span className="text-[11px] opacity-80">Best: {longestStreak}d</span>
        </>
      ) : null}
    </div>
  );
}
