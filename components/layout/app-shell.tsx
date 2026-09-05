import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

function AppShell({
  children,
  context,
}: {
  children: React.ReactNode;
  context?: string;
}) {
  return (
    <div className="flex h-full min-h-screen w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar context={context} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AppShell };
