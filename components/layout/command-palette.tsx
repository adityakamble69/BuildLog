"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Activity,
  Settings,
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchWorkspace, type SearchResultItem } from "@/app/actions/search";

interface NavItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
}

const STATIC_NAV_ITEMS: NavItem[] = [
  {
    id: "nav-dash",
    title: "Dashboard",
    subtitle: "Overview & metrics",
    href: "/dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    id: "nav-proj",
    title: "Projects",
    subtitle: "All your tracked projects",
    href: "/dashboard/projects",
    icon: <FolderKanban className="size-4" />,
  },
  {
    id: "nav-new",
    title: "New Project",
    subtitle: "Start tracking a new build",
    href: "/dashboard/projects/new",
    icon: <PlusCircle className="size-4" />,
  },
  {
    id: "nav-act",
    title: "Activity",
    subtitle: "Chronological activity audit feed",
    href: "/dashboard/activity",
    icon: <Activity className="size-4" />,
  },
  {
    id: "nav-set",
    title: "Settings",
    subtitle: "Profile, theme, and GitHub connection",
    href: "/dashboard/settings",
    icon: <Settings className="size-4" />,
  },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResultItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch search results on input change
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setSearchResults([]);
      setSelectedIndex(0);
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setLoading(false);
      setSelectedIndex(0);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchWorkspace(trimmed);
        setSearchResults(res);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
        setSelectedIndex(0);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, open]);

  // Unified items list for arrow navigation
  const allItems = React.useMemo(() => {
    if (!query.trim()) {
      return STATIC_NAV_ITEMS.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        href: item.href,
        icon: item.icon,
      }));
    }

    return searchResults.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || "",
      href: item.href,
      icon:
        item.category === "projects" ? (
          <FolderKanban className="size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        ),
    }));
  }, [query, searchResults]);

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (allItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        handleSelect(current.href);
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/70 hover:text-foreground"
        title="Quick search (Cmd+K / Ctrl+K)"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none hidden rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showClose={false}
          className="max-w-lg p-0 gap-0 overflow-hidden border border-border bg-card shadow-2xl"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Command Palette</DialogTitle>
          </DialogHeader>

          {/* Search bar */}
          <div className="flex items-center border-b border-border px-3.5 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search projects, tasks, or navigation..."
              className="ml-2.5 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {loading ? (
              <Clock className="size-3.5 animate-spin text-muted-foreground" />
            ) : (
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ESC
              </kbd>
            )}
          </div>

          {/* Results list */}
          <div className="max-h-80 overflow-y-auto p-2">
            {allItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                {query.trim() ? "No results found." : "No navigation items."}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {query.trim() ? "Search Results" : "Navigation & Quick Links"}
                </div>
                {allItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={isSelected ? "text-primary-foreground" : "text-muted-foreground"}>
                          {item.icon}
                        </span>
                        <div className="flex flex-col truncate">
                          <span className="font-medium truncate">{item.title}</span>
                          {item.subtitle ? (
                            <span
                              className={`text-xs truncate ${
                                isSelected
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {item.subtitle}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <ExternalLink
                        className={`size-3.5 shrink-0 ml-2 ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Use <kbd className="font-mono font-semibold">↑</kbd> <kbd className="font-mono font-semibold">↓</kbd> to navigate</span>
              <span>•</span>
              <span><kbd className="font-mono font-semibold">↵</kbd> to select</span>
            </div>
            <span>DevTrace Spotlight</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
