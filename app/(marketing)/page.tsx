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
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <div className="mx-auto flex max-w-5xl flex-col gap-24 px-4 py-16 sm:px-8 sm:py-24">
      <section className="flex flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          AI-powered development journal
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Know exactly where your build stands.
        </h1>
        <p className="max-w-xl text-balance text-muted-foreground sm:text-lg">
          BuildLog helps solo developers track projects, log real progress,
          and use AI to spot blockers and decide what to do next.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">Start tracking for free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="size-4.5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
