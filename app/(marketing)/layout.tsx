import * as React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#18181B] text-neutral-900 p-1 sm:p-2 md:p-2.5 flex flex-col items-center">
      {children}
    </div>
  );
}
