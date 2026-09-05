"use client";

import * as React from "react";
import { CheckCircle2, Clock, ListTodo, AlertCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/db/schema/tasks";

interface TaskVelocityChartProps {
  tasks: Task[];
  title?: string;
}

export function TaskVelocityChart({
  tasks,
  title = "Task Velocity & Breakdown",
}: TaskVelocityChartProps) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;

  const highPriority = tasks.filter((t) => t.priority === "high").length;
  const mediumPriority = tasks.filter((t) => t.priority === "medium").length;
  const lowPriority = tasks.filter((t) => t.priority === "low").length;

  const donePercent = total > 0 ? Math.round((done / total) * 100) : 0;
  const inProgressPercent = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const todoPercent = total > 0 ? 100 - donePercent - inProgressPercent : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {done} of {total} completed ({donePercent}%)
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Multi-segment progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/50 border border-border/40">
            {donePercent > 0 && (
              <div
                style={{ width: `${donePercent}%` }}
                className="bg-emerald-500 transition-all duration-300"
                title={`Done: ${done} (${donePercent}%)`}
              />
            )}
            {inProgressPercent > 0 && (
              <div
                style={{ width: `${inProgressPercent}%` }}
                className="bg-primary transition-all duration-300"
                title={`In Progress: ${inProgress} (${inProgressPercent}%)`}
              />
            )}
            {todoPercent > 0 && (
              <div
                style={{ width: `${todoPercent}%` }}
                className="bg-muted-foreground/30 transition-all duration-300"
                title={`To Do: ${todo} (${todoPercent}%)`}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Done ({done})
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-primary" /> In Progress ({inProgress})
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-muted-foreground/40" /> Planned ({todo})
            </span>
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-3">
          <div className="flex flex-col gap-0.5 rounded border border-rose-500/20 bg-rose-500/5 p-2 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-500">
              High Priority
            </span>
            <span className="font-mono text-base font-semibold text-foreground">
              {highPriority}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded border border-amber-500/20 bg-amber-500/5 p-2 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">
              Medium
            </span>
            <span className="font-mono text-base font-semibold text-foreground">
              {mediumPriority}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded border border-border bg-muted/20 p-2 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Low
            </span>
            <span className="font-mono text-base font-semibold text-foreground">
              {lowPriority}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
