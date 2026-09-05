import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/projects/project-list";
import { ProjectTagFilter } from "@/components/projects/project-tag-filter";
import { getProjects, getAllProjectTags } from "@/app/actions/projects";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [projects, allTags] = await Promise.all([
    getProjects(tag),
    getAllProjectTags(),
  ]);

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
        {projects.length > 0 || tag ? (
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
        ) : null}
      </div>

      {allTags.length > 0 ? <ProjectTagFilter tags={allTags} /> : null}

      <ProjectList
        projects={projects}
        emptyState={
          tag
            ? {
                title: "No projects with this tag",
                description: "Try a different tag or clear the filter.",
              }
            : undefined
        }
      />
    </div>
  );
}
