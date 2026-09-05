"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

function ProjectTagFilter({ tags }: { tags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateTag(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) {
      params.delete("tag");
    } else {
      params.set("tag", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Select value={searchParams.get("tag") ?? ALL} onValueChange={updateTag}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="All tags" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All tags</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { ProjectTagFilter };
