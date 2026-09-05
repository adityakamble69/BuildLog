# BuildLog --- Project Memory / Current State

> This file is the live project state. Update it whenever meaningful
> development progress occurs.

## Current Phase

**Phase 2 --- UI Foundation (complete)**

## Current Task

Begin Phase 3 --- Authentication.

## Project Status

Phase 1 and Phase 2 complete. Ready for Phase 3.

## Completed Features

-   [x] Product concept defined
-   [x] BuildLog MVP scope defined
-   [x] Core user journey defined
-   [x] Clerk selected for authentication
-   [x] PostgreSQL selected for persistence
-   [x] OpenAI selected for AI functionality
-   [x] Next.js + TypeScript selected for application
-   [x] Initial architecture defined
-   [x] Initial database model defined
-   [x] Development rules defined
-   [x] Development phases defined
-   [x] Design system defined

## Completed Documentation

-   [x] PRD.md
-   [x] architecture.md
-   [x] database.md
-   [x] rules.md
-   [x] phases.md
-   [x] design.md
-   [x] memory.md

## Files Currently Being Modified

None.

## Phase 1 Sub-Split

Phase 1 was divided into two parts for clarity:

-   **Phase 1A --- App Scaffolding**: Next.js + TypeScript app, Tailwind
    CSS, shadcn/ui primitives, `docs/` folder copied into the repo.
-   **Phase 1B --- Data & Auth Wiring**: Clerk installed and wired
    (middleware + provider + server-side identity helper), Drizzle ORM
    schema for all 5 tables, Drizzle Kit migration config, `.env.example`.

## Completed Features (Phase 1 additions)

-   [x] Next.js + TypeScript app scaffolded (App Router)
-   [x] Tailwind CSS configured
-   [x] shadcn/ui primitives created manually (button, card, badge,
        input, textarea, label, skeleton, separator) --- the
        `ui.shadcn.com` CLI registry was not reachable in the build
        sandbox, so components were hand-authored to match shadcn
        conventions. Revisit with the live CLI when network access
        allows it.
-   [x] Design tokens from design.md implemented as CSS variables
        (dark-first theme)
-   [x] Clerk installed, middleware protecting `/dashboard`, provider
        wired into root layout, server-side identity helper added
-   [x] Drizzle ORM configured with `pg` driver and pooled client
-   [x] Full schema created: projects, tasks, dev_logs, ai_insights,
        activity_logs (matches database.md exactly)
-   [x] `.env.example` created with Clerk, database, and OpenAI vars
-   [x] Shared Zod validation primitives added

## Pending Tasks

-   [ ] Configure real Clerk project keys (`.env.local`)
-   [ ] Create Supabase project and get pooler + direct connection
        strings
-   [ ] Set `DATABASE_URL` (pooler, 6543) and `DIRECT_URL` (direct,
        5432) in `.env.local`
-   [ ] Run first Drizzle migration (`drizzle-kit generate` + `migrate`)
-   [ ] Build real sign-in/sign-up routes (Phase 3)
-   [ ] Replace placeholder dashboard content with real project data (Phase 4+)

## Completed Features (Phase 2 additions)

-   [x] Application shell: `AppShell` combining `Sidebar` + `Topbar`
-   [x] Desktop sidebar with active-item highlighting (Dashboard,
        Projects, Activity, Settings)
-   [x] Mobile sidebar as a `Sheet` drawer with menu trigger
-   [x] Topbar with app identity, current context, and user menu
        (Clerk `UserButton` when signed in, sign-in/sign-up links when
        signed out)
-   [x] Additional shadcn-style primitives: `dropdown-menu`, `sheet`
-   [x] Loading/empty/error state components (`EmptyState`, `ErrorState`,
        `CardSkeleton`/`CardGridSkeleton`) following design.md #17--19
-   [x] Landing page foundation under `app/(marketing)/` with hero and
        feature grid
-   [x] Dashboard route (`app/dashboard/`) wired to `AppShell` and
        protected by `proxy.ts` (see below)
-   [x] Renamed `middleware.ts` --- `proxy.ts` per the Next.js 16
        convention change (file convention only; behavior unchanged)

## Known Bugs

None. Note: production build could not be verified end-to-end in the
sandbox because outbound access to `fonts.googleapis.com` is blocked
by network policy here; this is a sandbox limitation, not an
application defect, and is expected to resolve on a normal machine or
on Vercel.

## Current Errors

None.

## Important Decisions

### Product

BuildLog is an AI development journal/project tracker, not a full
project-management replacement.

### Authentication

Clerk is the authentication and identity provider.

### Database

PostgreSQL, hosted on **Supabase**, is the application data source of
truth. Supabase is used only as a managed Postgres host --- Clerk
remains the sole authentication provider (Supabase Auth is not used).

Driver: `postgres` (postgres.js) via `drizzle-orm/postgres-js`, with
`prepare: false`, because Supabase's Transaction-mode connection
pooler does not support prepared statements. The app runtime uses the
pooler URL (`DATABASE_URL`, port 6543); migrations use the direct
connection (`DIRECT_URL`, port 5432).

### ORM

Drizzle ORM is selected for typed database access and migrations.

### AI

OpenAI is used server-side for contextual development-log analysis and
project reports.

### Architecture

Use a modular monolith with Next.js rather than microservices.

### MVP Scope

Prioritize: - Authentication - Projects - Tasks - Development logs - AI
analysis - Dashboard - Ship Score - Deployment

Avoid unnecessary integrations during the event MVP.

## Recent Changes

-   Established BuildLog product direction.
-   Defined MVP feature set.
-   Defined system architecture.
-   Defined initial relational schema.
-   Defined design system.
-   Defined phased roadmap.
-   Established development/security rules.

## Next Task

**Begin Phase 1 --- Project Foundation** after confirming the
documentation is accepted as the initial source of truth.

## Deployment Status

Not deployed.

## Documentation Change Log

### Initial Documentation

-   Created initial PRD.
-   Created initial architecture.
-   Created initial database design.
-   Created initial development rules.
-   Created initial roadmap.
-   Created initial design system.
-   Created initial project memory.

### Database Provider Change --- Supabase

-   Switched hosted PostgreSQL provider to Supabase.
-   Switched Drizzle driver from `pg` (node-postgres) to `postgres`
    (postgres.js) with `prepare: false`, required for Supabase's
    Transaction-mode pooler.
-   Split connection strings: `DATABASE_URL` (pooler, runtime) and
    `DIRECT_URL` (direct, migrations only).
-   Updated `database.md` and `architecture.md` accordingly.

## Source-of-Truth Rule

If implementation and documentation disagree, stop and reconcile the
documentation before making a significant architectural or schema
change.
