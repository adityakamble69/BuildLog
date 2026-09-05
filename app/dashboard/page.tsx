import { FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Project progress, activity, and AI insights will appear here.
        </p>
      </div>

      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create your first project to start tracking your build."
        action={<Button>Create project</Button>}
      />
    </div>
  );
}
