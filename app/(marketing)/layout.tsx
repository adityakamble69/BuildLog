import { Logo } from "@/components/layout/logo";
import { UserMenu } from "@/components/layout/user-menu";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-8">
        <Logo href="/" />
        <UserMenu />
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-8">
        <p>
          BuildLog --- an AI-powered development journal and project tracker.
        </p>
      </footer>
    </div>
  );
}
