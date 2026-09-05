import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/projects/project-list";
import { getProjects } from "@/app/actions/projects";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Everything you&apos;re building, in one place.
          </p>
        </div>
        {projects.length > 0 ? (
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
        ) : null}
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}
