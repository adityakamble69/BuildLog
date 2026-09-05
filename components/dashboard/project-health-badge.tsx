import { Badge } from "@/components/ui/badge";
import type { ShipScoreStatus } from "@/lib/utils/ship-score";

/**
 * Per docs/design.md #15: color is never the only status indicator, so
 * the label always renders alongside the semantic badge color.
 */
function ProjectHealthBadge({ status }: { status: ShipScoreStatus }) {
  return <Badge variant={status.variant}>{status.label}</Badge>;
}

export { ProjectHealthBadge };
