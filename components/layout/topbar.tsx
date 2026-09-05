import { MobileSidebar } from "./mobile-sidebar";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";

function Topbar({ context }: { context?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/40">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div className="lg:hidden">
          <Logo />
        </div>
        {context ? (
          <>
            <span className="hidden text-border lg:inline">/</span>
            <span className="hidden text-sm font-medium text-muted-foreground lg:inline">
              {context}
            </span>
          </>
        ) : null}
      </div>
      <UserMenu />
    </header>
  );
}

export { Topbar };
