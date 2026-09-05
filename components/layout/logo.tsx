import Link from "next/link";
import Image from "next/image";

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
      <Image
        src="/logo.png"
        alt="DevTrace"
        width={28}
        height={28}
        className="size-7 shrink-0 rounded-md"
        priority
      />
      <span>DevTrace</span>
    </Link>
  );
}

export { Logo };
