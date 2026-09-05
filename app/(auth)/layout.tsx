import { Logo } from "@/components/layout/logo";

// Per docs/rules.md and docs/architecture.md: Clerk is the only
// authentication provider. This layout only provides shared chrome
// (logo + centered card frame) around Clerk's own <SignIn>/<SignUp>
// components — no custom auth logic lives here.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-4 sm:px-8">
        <Logo href="/" />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
