import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The single consistent "AI generated" indicator used everywhere AI output
 * is shown, per docs/design.md #25 — identifiable but not overwhelming.
 */
function AiInsightBadge({ className }: { className?: string }) {
  return (
    <Badge variant="info" className={cn(className)}>
      <Sparkles className="size-3" />
      AI Insight
    </Badge>
  );
}

export { AiInsightBadge };
