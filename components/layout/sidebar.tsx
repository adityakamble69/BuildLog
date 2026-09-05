import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Logo />
      </div>
      <SidebarNav />
    </aside>
  );
}

export { Sidebar };
