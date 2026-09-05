"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";

/**
 * The interactive part of a project card (dropdown + delete dialog).
 * Split out from project-card.tsx so that component can stay a Server
 * Component — an inline `onSelect` handler can't be passed from a
 * Server Component straight into a Client Component (docs/architecture.md
 * #3: client components only where interaction requires browser state).
 */
function ProjectCardActions({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          aria-label={`Actions for ${projectName}`}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/projects/${projectId}/edit`}>
            <Pencil />
            Edit
          </Link>
        </DropdownMenuItem>
        <DeleteProjectDialog
          projectId={projectId}
          projectName={projectName}
          trigger={
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ProjectCardActions };
