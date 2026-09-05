import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ClipboardList,
  BookText,
  BrainCircuit,
  LayoutDashboard,
  Gauge,
  Rocket,
} from "lucide-react";
import { IdeWindow } from "@/components/marketing/ide-window";

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
      "Journal what you built, what you learned, and what's blocking you in real-time.",
  },
  {
    icon: BrainCircuit,
    title: "AI log analysis",
    description:
      "Summarize progress, surface blockers, and generate project learning summaries.",
  },
  {
    icon: LayoutDashboard,
    title: "Live dashboard",
    description:
      "See active projects, recent activity, developer streaks, and latest AI insights.",
  },
  {
    icon: Gauge,
    title: "Ship Score",
    description:
      "A simple, transparent readiness indicator based on real activity and task completion.",
  },
  {
    icon: Rocket,
    title: "Built to ship",
    description:
      "Designed specifically for builders to go from zero to deployed candidates smoothly.",
  },
] as const;

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="w-full max-w-[99vw] 2xl:max-w-[1800px] mx-auto flex flex-col gap-14 py-1 sm:py-2">
      {/* Outer Drafting Canvas with Double Border filling the full screen */}
      <div className="relative min-h-[calc(100vh-1.5rem)] rounded-2xl border-2 border-black bg-[#F5F2EB] text-neutral-900 shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Top Navbar */}
        <header className="relative flex items-center justify-between px-5 sm:px-10 py-3 bg-[#F5F2EB]">
          {/* Only Name of the web app without any icon */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 hover:opacity-80 transition-opacity"
          >
            DevTrace
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {userId ? (
              <Link
                href="/dashboard"
                className="rounded bg-black px-4 py-1 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded border border-black bg-[#F5F2EB] px-3.5 py-1 text-xs font-semibold text-neutral-900 transition-colors hover:bg-black/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded bg-black px-4 py-1 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Upper Hatched Diagonal Stripe Ribbon */}
        <div className="h-3.5 w-full border-t border-b border-black bg-[repeating-linear-gradient(45deg,#000_0px,#000_1px,transparent_1px,transparent_6px)]" />

        {/* Hero Section on Graph Paper Grid */}
        <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-4 md:p-5 pb-0 sm:pb-0 md:pb-0 bg-[#F5F2EB] bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] bg-[size:24px_24px]">
          {/* Signature Inner Framing Rectangle from Reference Image */}
          <div className="flex-1 border border-black p-3 sm:p-5 md:p-6 pb-0 sm:pb-0 md:pb-0 text-center bg-transparent flex flex-col justify-between items-center">
            {/* Top portion: Headline & CTA */}
            <div className="w-full flex flex-col items-center pt-2 sm:pt-3">
              {/* Main Headline with contrasting grey second line */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[62px] font-extrabold tracking-tight leading-[1.1] text-neutral-900 max-w-4xl mx-auto">
                <span className="block font-extrabold">For Developers Who Swear</span>
                <span className="block font-semibold text-neutral-400 mt-1 sm:mt-1.5">
                  It Wasn&apos;t Their Fault
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-3 sm:mt-3.5 text-xs sm:text-sm md:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
                Your AI-powered dev space that catches the obvious, the subtle,
                and the &ldquo;how did that even happen?&rdquo; &mdash; track projects, log progress, and calculate your Ship Score.
              </p>

              {/* Centered Single CTA Button */}
              <div className="mt-4 sm:mt-5 flex items-center justify-center">
                {userId ? (
                  <Link
                    href="/dashboard"
                    className="rounded-md bg-black px-7 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
                  >
                    Go to Dashboard &rarr;
                  </Link>
                ) : (
                  <Link
                    href="/sign-up"
                    className="rounded-md bg-black px-7 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>

            {/* Centered IDE Window Mockup */}
            <div className="w-full mt-4 sm:mt-5">
              <IdeWindow />
            </div>
          </div>
        </div>

        {/* Lower Hatched Diagonal Stripe Ribbon */}
        <div className="h-3.5 w-full border-t border-b border-black bg-[repeating-linear-gradient(45deg,#000_0px,#000_1px,transparent_1px,transparent_6px)]" />

        {/* Bottom 4-Column Bar matching reference */}
        <footer className="grid grid-cols-2 lg:grid-cols-4 bg-[#F5F2EB] divide-y lg:divide-y-0 divide-x divide-black text-neutral-900">
          {/* 1: Next.js */}
          <div className="flex items-center justify-center gap-2.5 py-3 px-3 hover:bg-black/5 transition-colors">
            <span className="text-sm font-black">▲</span>
            <span className="font-bold text-xs sm:text-sm tracking-tight">Next.js 16</span>
          </div>

          {/* 2: PostgreSQL */}
          <div className="flex items-center justify-center gap-2.5 py-3 px-3 hover:bg-black/5 transition-colors">
            <span className="text-sm">⛁</span>
            <span className="font-bold text-xs sm:text-sm tracking-tight">PostgreSQL</span>
          </div>

          {/* 3: Developer: Aditya */}
          <div className="flex items-center justify-center gap-2.5 py-3 px-3 hover:bg-black/5 transition-colors">
            <span className="text-sm">👤</span>
            <span className="font-bold text-xs sm:text-sm tracking-tight">Developer: Aditya</span>
          </div>

          {/* 4: Gemini AI */}
          <div className="flex items-center justify-center gap-2.5 py-3 px-3 hover:bg-black/5 transition-colors">
            <span className="text-sm text-purple-700">✦</span>
            <span className="font-bold text-xs sm:text-sm tracking-tight">Gemini AI</span>
          </div>
        </footer>
      </div>

      {/* Feature Breakdown Section in the Same Architectural Aesthetic */}
      <section id="features" className="rounded-2xl border-2 border-black bg-[#F5F2EB] p-6 sm:p-10 shadow-xl">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              What&rsquo;s inside DevTrace
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Everything you need to turn raw developer effort into shipped products.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-black/10 border-t border-black/20">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[220px_1fr] sm:gap-8 items-center"
                >
                  <div className="flex items-center gap-2.5 text-neutral-900 font-semibold text-sm">
                    <div className="flex size-7 items-center justify-center rounded-md border border-black/20 bg-white">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <span>{feature.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <div className="rounded-2xl border-2 border-black bg-[#F5F2EB] p-6 sm:p-8 text-center flex flex-col items-center gap-4 shadow-xl">
        <h2 className="text-2xl font-bold text-neutral-900">
          Ready to track your next build?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-md">
          Start journaling progress, calculating your Ship Score, and shipping with confidence.
        </p>
        <Link
          href="/sign-up"
          className="rounded bg-black px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800"
        >
          Start tracking for free
        </Link>
      </div>
    </div>
  );
}
