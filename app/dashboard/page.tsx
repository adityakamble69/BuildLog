import { FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUserDisplay } from "@/lib/auth/current-user";

export default async function DashboardPage() {
  // proxy.ts already guarantees a session exists for /dashboard(.*),
  // so this is for greeting/display only — never for authorization.
  const user = await getCurrentUserDisplay();
  const greetName = user?.firstName ?? user?.fullName;

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
        action={<Button>Create project</Button>}
      />
    </div>
  );
}
