import * as React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#18181B] text-neutral-900 p-1 sm:p-2 md:p-2.5 flex flex-col items-center justify-center">
      <div className="w-full max-w-[98vw] 2xl:max-w-[1600px] mx-auto flex flex-col py-1 sm:py-2">
        {/* Outer Drafting Canvas with Double Border */}
        <div className="relative min-h-[calc(100vh-1.5rem)] rounded-2xl border-2 border-black bg-[#F5F2EB] text-neutral-900 shadow-2xl overflow-hidden flex flex-col">
          {/* Top Navbar */}
          <header className="relative flex items-center justify-between px-5 sm:px-10 py-3 bg-[#F5F2EB]">
            {/* Only Name of the web app without any icon */}
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 hover:opacity-80 transition-opacity"
            >
              DevTrace
            </Link>

            {/* Right Action Button */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="rounded border border-black bg-[#F5F2EB] px-3.5 py-1 text-xs font-semibold text-neutral-900 transition-colors hover:bg-black/5"
              >
                &larr; Back to Home
              </Link>
            </div>
          </header>

          {/* Upper Hatched Diagonal Stripe Ribbon */}
          <div className="h-3.5 w-full border-t border-b border-black bg-[repeating-linear-gradient(45deg,#000_0px,#000_1px,transparent_1px,transparent_6px)]" />

          {/* Main Content Area on Graph Paper Grid */}
          <main className="flex-1 flex flex-col justify-center items-center p-3 sm:p-5 md:p-6 bg-[#F5F2EB] bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] bg-[size:24px_24px]">
            {/* Signature Inner Framing Rectangle */}
            <div className="w-full max-w-3xl lg:max-w-4xl flex-1 border border-black p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
