"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITY_ACTIONS } from "@/components/activity/activity-feed";
import type { Project } from "@/lib/db/schema/projects";

const ALL = "all";

function ActivityFilters({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: "project" | "action", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Any filter change starts back at page 1.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={searchParams.get("project") ?? ALL}
        onValueChange={(v) => updateParam("project", v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All projects</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("action") ?? ALL}
        onValueChange={(v) => updateParam("action", v)}
      >
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder="All activity types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All activity types</SelectItem>
          {ACTIVITY_ACTIONS.map((a) => (
            <SelectItem key={a.value} value={a.value}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { ActivityFilters };
