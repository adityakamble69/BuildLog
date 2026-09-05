import Link from "next/link";
import { Activity as ActivityIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { getAllActivity } from "@/app/actions/activity";

const PAGE_SIZE = 20;

/**
 * Full cross-project activity feed (docs/design.md #12 nav item).
 * The dashboard shows the latest 8 entries as a preview; this page is
 * the complete, paginated trail.
 */
export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Fetch one extra row to know whether a "next page" exists.
  const rows = await getAllActivity(PAGE_SIZE + 1, offset);
  const hasMore = rows.length > PAGE_SIZE;
  const activity = rows.slice(0, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
          Activity
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything that happened across your projects, newest first.
        </p>
      </div>

      {activity.length === 0 && page === 1 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No activity yet"
          description="Once you create tasks or add development logs, updates will show up here."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ActivityFeed activity={activity} />
          </CardContent>
        </Card>
      )}

      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between">
          {page > 1 ? (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/activity?page=${page - 1}`}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Previous
            </Button>
          )}
          <span className="text-xs text-muted-foreground">Page {page}</span>
          {hasMore ? (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/activity?page=${page + 1}`}>Next</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
