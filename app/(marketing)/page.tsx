import Link from "next/link";
import {
  BookText,
  BrainCircuit,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogPanelPreview } from "@/components/marketing/log-panel-preview";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Projects & tasks",
    description:
      "Track every project with tasks, priorities, and status in one focused workspace.",
  },
  {
    icon: BookText,
    title: "Development logs",
    description:
      "Journal what you built, what you learned, and what's blocking you.",
  },
  {
    icon: BrainCircuit,
    title: "AI log analysis",
    description:
      "Summarize progress, surface blockers, and get suggested next actions.",
  },
  {
    icon: LayoutDashboard,
    title: "Live dashboard",
    description:
      "See active projects, recent activity, and your latest AI insight at a glance.",
  },
  {
    icon: Gauge,
    title: "Ship Score",
    description:
      "A simple, transparent readiness indicator --- not a fake science experiment.",
  },
  {
    icon: Rocket,
    title: "Built to ship",
    description:
      "Focused MVP scope designed to go from idea to deployed in a day.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-20 px-4 py-16 sm:px-8 sm:py-24">
      <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <h1 className="max-w-lg text-4xl font-semibold tracking-tight sm:text-5xl">
            Know exactly where your build stands.
          </h1>
          <p className="max-w-md text-balance text-muted-foreground sm:text-lg">
            BuildLog helps solo developers track projects, log real progress,
            and use AI to spot blockers and decide what to do next.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">Start tracking for free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>

        <LogPanelPreview />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          What&rsquo;s inside
        </h2>
        <div className="flex flex-col divide-y divide-border border-t border-border">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-8"
              >
                <div className="flex items-center gap-2.5 text-foreground">
                  <Icon className="size-4 shrink-0 text-primary" />
                  <span className="font-medium">{feature.title}</span>
                </div>
                <p className="text-sm text-muted-foreground sm:text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col items-start gap-4 border-t border-border pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          Ready to track your next build?
        </h2>
        <Button asChild size="lg">
          <Link href="/sign-up">Start tracking for free</Link>
        </Button>
      </section>
    </div>
  );
}
