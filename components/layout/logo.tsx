import Link from "next/link";
import { Terminal } from "lucide-react";

import { cn } from "@/lib/utils";

function Logo({ className, href = "/dashboard" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight text-foreground",
        className
      )}
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Terminal className="size-4" />
      </span>
      <span>BuildLog</span>
    </Link>
  );
}

export { Logo };
