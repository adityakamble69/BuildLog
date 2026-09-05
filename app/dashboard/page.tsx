import Link from "next/link";
import { FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectList } from "@/components/projects/project-list";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { LatestInsightCard } from "@/components/dashboard/latest-insight-card";
import { getCurrentUserDisplay } from "@/lib/auth/current-user";
import { getDashboardOverview } from "@/app/actions/dashboard";

export default async function DashboardPage() {
  // proxy.ts already guarantees a session exists for /dashboard(.*),
  // so this is for greeting/display only — never for authorization.
  const user = await getCurrentUserDisplay();
  const greetName = user?.firstName ?? user?.fullName;
  const overview = await getDashboardOverview();

  if (overview.projects.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
            {greetName ? `Welcome back, ${greetName}` : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Project progress, activity, and AI insights will appear here.
          </p>
        </div>
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start tracking your build."
          action={
            <Button asChild>
              <Link href="/dashboard/projects/new">Create project</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const healthByProjectId = new Map(
    overview.projects.map(({ project, status }) => [project.id, status])
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
          {greetName ? `Welcome back, ${greetName}` : "Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Project progress, activity, and AI insights across your build.
        </p>
      </div>

      <DashboardStats overview={overview} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Active projects</h2>
          <ProjectList
            projects={overview.projects.map((p) => p.project).slice(0, 6)}
            healthByProjectId={healthByProjectId}
          />
        </div>

        <aside className="flex flex-col gap-6">
          <LatestInsightCard insight={overview.latestInsight} />

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activity={overview.recentActivity} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
