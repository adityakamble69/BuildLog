"use client";

import * as React from "react";
import { toCalendarDay } from "@/lib/utils/streaks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface ActivityHeatmapProps {
  timestamps: (Date | string | number)[];
  weeksCount?: number;
  title?: string;
}

export function ActivityHeatmap({
  timestamps,
  weeksCount = 20,
  title = "Development Activity Heatmap",
}: ActivityHeatmapProps) {
  // Count activities per YYYY-MM-DD
  const countsByDay = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const t of timestamps) {
      const day = toCalendarDay(t);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    return map;
  }, [timestamps]);

  // Generate grid columns (weeks) ending today
  const gridWeeks = React.useMemo(() => {
    const today = new Date();
    const weeks: { date: Date; dateStr: string; count: number }[][] = [];

    // Find the end of the current week (Saturday)
    const dayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
    const daysUntilEndOfWeek = 6 - dayOfWeek;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysUntilEndOfWeek);

    const totalDays = weeksCount * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    const curr = new Date(startDate);
    let currentWeek: { date: Date; dateStr: string; count: number }[] = [];

    while (curr <= endDate) {
      const dateStr = toCalendarDay(curr);
      const count = countsByDay.get(dateStr) ?? 0;
      currentWeek.push({
        date: new Date(curr),
        dateStr,
        count,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [countsByDay, weeksCount]);

  function getIntensityClass(count: number): string {
    if (count === 0) return "bg-muted/40 border border-border/40";
    if (count === 1) return "bg-primary/30 border border-primary/40";
    if (count <= 3) return "bg-primary/60 border border-primary/60";
    if (count <= 5) return "bg-primary/80 border border-primary/80";
    return "bg-primary border border-primary text-primary-foreground";
  }

  const totalEntries = timestamps.length;
  const activeDays = countsByDay.size;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {totalEntries} {totalEntries === 1 ? "entry" : "entries"} across {activeDays} {activeDays === 1 ? "day" : "days"}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex gap-1.5 min-w-full">
            {gridWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => {
                  const isFuture = day.date > new Date();
                  if (isFuture) {
                    return (
                      <div
                        key={day.dateStr}
                        className="size-3.5 rounded-sm opacity-10 bg-muted/20"
                      />
                    );
                  }
                  return (
                    <div
                      key={day.dateStr}
                      title={`${day.count} activity on ${day.dateStr}`}
                      className={`size-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer ${getIntensityClass(
                        day.count
                      )}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span>Past {weeksCount} weeks</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="size-2.5 rounded-sm bg-muted/40 border border-border/40" />
            <div className="size-2.5 rounded-sm bg-primary/30 border border-primary/40" />
            <div className="size-2.5 rounded-sm bg-primary/60 border border-primary/60" />
            <div className="size-2.5 rounded-sm bg-primary border border-primary" />
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
