import { UserProfile } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/settings/theme-toggle";

/**
 * Settings (docs/PRD.md #10, docs/architecture.md #13).
 *
 * DevTrace has no app-level preferences of its own yet (theme, notifications,
 * etc. are not in MVP scope per docs/phases.md). Per docs/rules.md — "no
 * custom password storage", "use Clerk" — account settings (profile, email,
 * password, connected accounts, security) are delegated entirely to Clerk's
 * prebuilt UserProfile, themed to match the rest of the app the same way
 * sign-in/sign-up already do.
 */
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, email, and account security.
        </p>
      </div>

      <ThemeToggle />

      <UserProfile
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none border border-border rounded-xl",
            card: "w-full bg-card text-card-foreground",
            navbar: "border-border",
            navbarButton: "text-foreground",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            profileSectionTitleText: "text-foreground",
            formFieldLabel: "text-foreground",
            formFieldInput:
              "bg-background border border-input text-foreground focus:border-ring focus:ring-ring",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90",
            badge: "bg-secondary text-secondary-foreground border border-border",
          },
        }}
      />
    </div>
  );
}
