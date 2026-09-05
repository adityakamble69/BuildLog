# BuildLog --- Project Memory / Current State

> This file is the live project state. Update it whenever meaningful
> development progress occurs.

## Current Phase

**Phase 7 --- Dashboard + Ship Score (complete)**

## Current Task

Begin Phase 8 --- Testing + Security.

## Project Status

Phase 1 through Phase 7 complete. Ready for Phase 8.

## Completed Features

-   [x] Product concept defined
-   [x] BuildLog MVP scope defined
-   [x] Core user journey defined
-   [x] Clerk selected for authentication
-   [x] PostgreSQL selected for persistence
-   [x] Gemini selected for AI functionality (originally OpenAI; see
        "AI Provider Change" in the Documentation Change Log)
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
-   [~] Run the generated migration against Supabase
        (`npx drizzle-kit migrate`) --- user ran this and it returned
        cleanly (no error output); table creation not independently
        re-verified in this session, so leaving this open until
        confirmed.
-   [x] Replace placeholder AI-insight content with real Gemini output
        (Phase 6)
-   [ ] Set a real `GEMINI_API_KEY` in `.env.local` to exercise AI
        features locally (calls fail gracefully without one)

## Completed Features (Phase 5 additions)

-   [x] `lib/validations/tasks.ts`, `lib/validations/dev-logs.ts`: Zod
        schemas for task/dev-log create, update, and quick
        status-change payloads
-   [x] `app/actions/tasks.ts`: `getTasksByProject`, `createTask`,
        `updateTask`, `updateTaskStatus`, `deleteTask` --- ownership is
        inherited from the parent project (tasks have no `user_id` of
        their own), enforced via `getProjectById()` on every mutation
-   [x] `app/actions/dev-logs.ts`: `getDevLogsByProject`,
        `createDevLog`, `updateDevLog`, `deleteDevLog` --- dev logs do
        carry `user_id`, so edit/delete check it directly
-   [x] `app/actions/activity.ts`: `recordActivity()` (internal, called
        from the tasks/dev-logs actions after a successful mutation)
        and `getRecentActivity()`, scoped through a join on
        `projects.user_id`
-   [x] Activity events recorded: `task_created`, `task_completed`
        (status --- \> done), `task_status_changed` (other transitions),
        `task_deleted`, `dev_log_added`. Plain field edits (title,
        description, priority, due date) are not logged, to keep the
        trail meaningful rather than noisy
-   [x] `components/tasks/`: `task-board` (3-column board grouped by
        status, per-column "add task"), `task-card` (quick "Move to"
        status menu + edit/delete), `task-form-dialog` (create/edit,
        modal per design.md #14), `delete-task-dialog`,
        `task-priority-badge`
-   [x] `components/dev-logs/`: `dev-log-form` (always-visible inline
        composer), `dev-log-list`, `dev-log-item` (hover-to-reveal
        inline edit/delete, delete confirmed via dialog)
-   [x] `components/activity/activity-feed.tsx`: renders
        `getRecentActivity()` results with a per-action icon and a
        plain-English description built from the stored metadata
-   [x] `components/projects/project-progress.tsx`: completed/total
        task percentage per docs/database.md #11, with the zero-task
        case handled explicitly (no tasks --- \> no percentage shown)
-   [x] `app/dashboard/projects/[id]/page.tsx` rewired: progress bar,
        task board, development log, and a recent-activity sidebar
        replace the Phase 4 placeholders
-   [x] Verified via `tsc --noEmit`, ESLint, and a full `next build`
        (using a throwaway copy with dummy env vars and stubbed Google
        Fonts, per the same sandbox limitation noted above) --- all
        routes compile and typecheck cleanly

## Completed Features (Phase 6 additions)

-   [x] `lib/ai/client.ts`: server-only Gemini wrapper
        (`callAiForJson()`) — reads `GEMINI_API_KEY`, calls
        Gemini's `generateContent` endpoint with
        `generationConfig.responseMimeType: "application/json"`, and
        throws a single `AiServiceError` for every failure mode (missing
        key, network failure, non-2xx status, empty/unparsable content).
        Uses raw `fetch` rather than an SDK per docs/rules.md #17 (no
        dependency added). Originally implemented against OpenAI's Chat
        Completions API; switched to Gemini — see "AI Provider Change"
        below. The rest of the AI code (`log-analysis.ts`,
        `project-report.ts`, `app/actions/ai.ts`, `components/ai/`)
        was unaffected by the swap, since `callAiForJson()` is the only
        module that talks to the provider.
-   [x] `lib/ai/log-analysis.ts` / `lib/ai/project-report.ts`: prompt
        construction + calls into `callAiForJson()`, each returning a
        `zod`-validated, normalized result (`lib/validations/ai.ts`).
        Both throw `AiServiceError` on a schema mismatch instead of
        storing/returning unvalidated model output (docs/PRD.md #8).
-   [x] `lib/validations/ai.ts`: `devLogAnalysisRequestSchema`,
        `projectReportRequestSchema` (request-side), and
        `logAnalysisResultSchema` / `projectReportResultSchema`
        (AI-output-side) validation.
-   [x] `app/actions/ai.ts`: `generateLogAnalysis`, `getLogAnalysis`,
        `getLogAnalysesByProject` (one query for a whole log list, avoids
        N+1), `generateProjectReport`, `getLatestProjectReport`. Every
        action re-derives identity via `requireUserId()` and re-checks
        ownership (dev log → its `user_id`; project report → 
        `getProjectById()`) before touching the AI service or the
        database. AI failures are caught and turned into
        `{ success: false, error }` — they never throw past this
        boundary and never leave a misleading/partial insight row.
-   [x] `ai_insights` rows: `type: "log_analysis"` (scoped to one
        `dev_log_id`) and `type: "report"` (project-level,
        `dev_log_id: null`) — matches the schema already created in
        Phase 1B/`docs/database.md`; no schema change needed for Phase 6.
-   [x] `components/ai/`: `AiInsightBadge` (the one consistent AI
        indicator per docs/design.md #25), `LogAnalysisView` /
        `LogAnalysisPanel` (on-demand "Analyze with AI" button per dev
        log, embedded in `DevLogItem`), `ProjectReportView` /
        `ProjectReportCard` (on-demand "Generate report" card in the
        project detail sidebar). Analysis/report generation is
        deliberately on-demand rather than automatic, per docs/rules.md
        #18 (avoid expensive AI calls on every page load).
-   [x] `components/dev-logs/dev-log-item.tsx` and `dev-log-list.tsx`
        updated to accept an optional pre-fetched insight
        (`getLogAnalysesByProject()` is called once per project-detail
        page load, not once per log entry).
-   [x] `app/dashboard/projects/[id]/page.tsx`: wired
        `getLogAnalysesByProject()` and `getLatestProjectReport()`
        alongside the existing Phase 5 data fetches, and added
        `ProjectReportCard` to the project detail sidebar above Recent
        Activity.
-   [x] Verified with `tsc --noEmit` against a throwaway
        `node_modules`/type-stub setup (same sandbox network limitation
        as prior phases — no live OpenAI or Supabase calls were made);
        no new dependency was added, so `package.json` is unchanged.

## Completed Features (Phase 4 additions)

-   [x] `lib/validations/projects.ts`: Zod schema for project
        create/update
-   [x] `app/actions/projects.ts`: `getProjects`, `getProjectById`,
        `createProject`, `updateProject`, `deleteProject`, all scoped
        by the authenticated Clerk user id
-   [x] `components/ui/dialog.tsx`, `components/ui/select.tsx` added
        (shadcn-style primitives that didn't exist yet, needed for the
        project form/delete-confirmation)
-   [x] `components/projects/`: `project-form`, `project-card`,
        `project-list`, `project-status-badge`,
        `delete-project-dialog`
-   [x] Routes: `/dashboard/projects` (list), `/dashboard/projects/new`
        (create), `/dashboard/projects/[id]` (detail),
        `/dashboard/projects/[id]/edit`
-   [x] Dashboard empty-state CTA wired to the new-project route; shows
        real projects once they exist
-   [x] Added the indexes `docs/database.md` #9 recommends but the
        Phase 1B schema was missing (`projects(user_id)`,
        `projects(user_id, status)`, `tasks(project_id)`,
        `tasks(project_id, status)`, and `created_at`-ordered indexes
        on `dev_logs`, `ai_insights`, `activity_logs`)
-   [x] Generated `drizzle/0000_luxuriant_shiva.sql` from the schema;
        user ran `npx drizzle-kit migrate` against it with no error
        output (not yet independently re-verified against the Supabase
        table list in this session)

## Completed Features (Phase 3 additions)

-   [x] `app/(auth)/layout.tsx`: shared centered chrome (logo only) for
        auth routes
-   [x] `app/(auth)/sign-in/[[...sign-in]]/page.tsx`: Clerk `<SignIn>`
        catch-all route, styled to design tokens via `appearance.elements`
-   [x] `app/(auth)/sign-up/[[...sign-up]]/page.tsx`: Clerk `<SignUp>`
        catch-all route, styled the same way
-   [x] `lib/auth/current-user.ts` extended with
        `getCurrentUserDisplay()` (name/email/avatar) for UI greetings ---
        display only, never used for authorization
-   [x] Dashboard now greets the signed-in user by first name using
        `getCurrentUserDisplay()`
-   [x] Verified `proxy.ts` protection, `UserButton` sign-out, and
        `requireUserId()`/`getCurrentUserId()` server identity already
        satisfied the remaining Phase 3 tasks from Phase 1B/2
-   [x] Verified production build succeeds (Turbopack) with the new
        routes; the only build failure is the pre-existing sandbox
        Google Fonts block noted below, unrelated to these changes

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

Gemini is used server-side for contextual development-log analysis and
project reports. (Originally OpenAI; switched — see "AI Provider Change"
in the Documentation Change Log below.)

### Architecture

Use a modular monolith with Next.js rather than microservices.

### MVP Scope

Prioritize: - Authentication - Projects - Tasks - Development logs - AI
analysis - Dashboard - Ship Score - Deployment

Avoid unnecessary integrations during the event MVP.

## Recent Changes

-   Fixed a pre-existing bug in `components/projects/project-card.tsx`
    (present since Phase 4/5, surfaced during Phase 7 manual testing):
    it's a Server Component that was building an inline `onSelect`
    handler and passing it straight into `DropdownMenuItem`, a Client
    Component — not allowed across the RSC boundary ("Event handlers
    cannot be passed to Client Component props"). Extracted the
    interactive dropdown (edit link + delete dialog trigger) into a new
    `components/projects/project-card-actions.tsx` (`"use client"`),
    so `ProjectCard` itself stays a Server Component per
    docs/architecture.md #3. No visual or behavioral change.
-   Noted, not fixed: `/dashboard/activity` and `/dashboard/settings`
    404 — `components/layout/nav-items.ts` has always linked to both,
    but neither page has been built. Not in scope for Phase 6/7; flagged
    for a future phase or explicit request.
-   Completed Phase 7 --- Dashboard + Ship Score:
    -   `lib/utils/ship-score.ts` --- pure, DB-free Ship Score
        calculation (task completion 0--50, recent activity 0--30,
        documentation/dev-log count 0--20, summing to a 0--100 score)
        with a per-factor plain-language breakdown and a status band
        (Just started / On track / Needs attention / At risk), per
        docs/PRD.md #7.8's "must remain understandable, not a
        scientific measurement" requirement.
    -   `app/actions/dashboard.ts` --- new `getDashboardOverview()`
        action: batched, grouped SQL (one query per table, not one per
        project) for task stats, dev-log counts, and last-activity
        timestamps across all of a user's projects, plus a
        cross-project recent-activity feed and latest AI insight,
        joined through `projects.user_id` for ownership.
    -   New `components/dashboard/`: `ship-score-meter.tsx`,
        `project-health-badge.tsx`, `dashboard-stats.tsx`,
        `latest-insight-card.tsx` --- per docs/architecture.md #11's
        recommended folder structure.
    -   `components/activity/activity-feed.tsx` extended with an
        optional per-entry `projectName` (used only by the dashboard's
        cross-project feed); `components/projects/project-card.tsx`
        and `project-list.tsx` extended with an optional health-badge
        prop. Both changes are additive/backward-compatible --- a
        project detail page's own single-project feed and any other
        existing caller needs no changes.
    -   Rebuilt `app/dashboard/page.tsx`: key-metrics grid, active
        projects (now showing a Ship Score health badge), cross-project
        recent activity, latest AI insight card.
    -   `app/dashboard/projects/[id]/page.tsx`: added a Ship Score card
        (full breakdown) to the sidebar and a health badge next to the
        existing project status badge.
    -   No schema or architecture changes --- built entirely on
        existing `tasks`/`dev_logs`/`activity_logs`/`ai_insights`
        tables and existing ownership patterns.
-   Completed Phase 5 --- Tasks + Development Logs: task board with
    quick status changes, development log composer/editor, activity
    tracking, and a completed/total task progress readout on the
    project detail page.
-   Completed Phase 4 --- Database + Projects: full project CRUD,
    ownership enforced server-side, migration generated and applied.
-   Design refresh across landing, dashboard, and auth (see
    "Design Refresh" below).
-   Completed Phase 3 --- Authentication: real sign-in/sign-up routes,
    user display helper, dashboard greeting.
-   Established BuildLog product direction.
-   Defined MVP feature set.
-   Defined system architecture.
-   Defined initial relational schema.
-   Defined design system.
-   Defined phased roadmap.
-   Established development/security rules.

## Next Task

**Begin Phase 6 --- AI Features**, per docs/phases.md.

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
-   Fixed `drizzle-kit` not picking up `.env.local`: `drizzle-kit` is a
    standalone CLI and does not read Next.js's `.env.local` convention
    on its own. `drizzle.config.ts` now calls `loadEnvConfig()` from
    `@next/env` (already bundled with `next`) to load env files the
    same way `next dev`/`next build` do.
-   Generated and verified the first migration
    (`drizzle/0000_silent_black_cat.sql`) against the schema in
    `database.md` --- all 5 tables, FKs, and cascade rules match.

### Clerk Core 3 Migration

-   `@clerk/nextjs` installs at Core 3 (released after this project's
    initial build). `<SignedIn>`/`<SignedOut>`/`<Protect>` are
    deprecated in favor of a single `<Show when="...">` component.
-   `components/layout/user-menu.tsx` updated to use
    `<Show when="signed-in">` / `<Show when="signed-out">`.
-   `ClerkProvider` moved from wrapping `<html>` to living inside
    `<body>` in `app/layout.tsx`, per the Core 3 Next.js requirement.

### AI Provider Change --- OpenAI to Gemini

-   Switched the AI provider from OpenAI to Gemini (docs/rules.md #20:
    architecture change recorded here before implementation).
-   Reason: provider preference for API key/billing setup; no
    functional gap in OpenAI drove the change.
-   `lib/ai/client.ts` (`callAiForJson()`) now calls Gemini's
    `generateContent` REST endpoint
    (`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`)
    with an `x-goog-api-key` header, instead of OpenAI's Chat
    Completions endpoint with a `Bearer` token. Structured JSON output
    is requested via `generationConfig.responseMimeType: "application/json"`
    (Gemini's equivalent of OpenAI's `response_format: json_object`).
    Default model: `gemini-flash-latest` (Gemini's non-versioned alias
    for the current flash model — a dated model id like
    `gemini-2.5-flash` was tried first and returned a 404 once Google
    retired that specific version; the `-latest` alias avoids repeating
    this whenever Google rotates model versions). A 404 from Gemini is
    logged server-side with a pointer to
    https://ai.google.dev/gemini-api/docs/models for diagnosing a future
    model-name issue, without leaking that detail to the UI.
-   Gemini has no separate "system" chat role — the system prompt is
    now sent via the dedicated `systemInstruction` field instead of a
    `system`-role message.
-   `callAiForJson()`'s signature, return type, and `AiServiceError`
    contract are unchanged, so `lib/ai/log-analysis.ts`,
    `lib/ai/project-report.ts`, `app/actions/ai.ts`, and
    `components/ai/*` required no changes.
-   Environment variable renamed: `OPENAI_API_KEY` → `GEMINI_API_KEY`
    in `.env.example` and `docs/rules.md` #11. Existing `.env.local`
    files need the new variable name set to a Gemini API key (Google
    AI Studio) instead of an OpenAI key.
-   Updated `docs/architecture.md` (#1, #10), `docs/PRD.md` (#9),
    `docs/rules.md` (#11), and `docs/phases.md` (Phase 6) to say
    Gemini instead of OpenAI. No schema or scope change — `ai_insights`
    storage, validation (`lib/validations/ai.ts`), and the
    log-analysis/report feature set are unaffected.

## Source-of-Truth Rule

If implementation and documentation disagree, stop and reconcile the
documentation before making a significant architectural or schema
change.

## Design Refresh (visual pass, no scope/schema changes)

The tokens in `design.md` (colors, type, radii, spacing) were already
implemented correctly since Phase 2 and were **not** changed. This
pass replaced generic layout defaults with choices grounded in the
product itself:

-   Landing hero: dropped the eyebrow pill + centered headline +
    icon-card grid. Replaced with a left-aligned headline next to a
    static `LogPanelPreview` (`components/marketing/log-panel-preview.tsx`)
    showing realistic timestamped dev-log lines, a project status
    badge, and a Ship Score readout with a progress bar --- the
    product's own artifact stands in for a generic feature-icon grid.
-   Feature section: replaced the 3-column card grid (identical
    radius/shadow/icon-square on every item) with a hairline-divided
    manifest-style list (label + description rows).
-   `font-mono` (JetBrains Mono), defined in `design.md` but unused
    until now, is applied to genuinely technical/machine-generated
    values: log timestamps, the Ship Score number, and the live
    project-status label. Sans (Inter) remains for human-authored
    copy. This is now the intended rule for future UI: mono for
    machine data, sans for authored text.
-   `components/ui/card.tsx`: removed the default `shadow-sm`. Per
    design.md #7, subtle shadows are for elevated elements (modals,
    popovers) only --- inline cards are separated by border alone.
-   `components/ui/empty-state.tsx`: icon wrapper changed from a
    filled circle to a bordered square, consistent with the card
    system instead of the generic filled-circle-icon default.
-   `app/dashboard/page.tsx`: page heading now sits at the documented
    H1 scale (32px) instead of H2 (24px).
-   One deliberate motion moment: a blinking terminal caret in the
    hero log panel only (`.animate-caret-blink` in `globals.css`,
    respects `prefers-reduced-motion`). No other new animations were
    added.
-   No changes to auth pages' structure beyond what Phase 3 already
    set up; they intentionally stay quiet so the hero remains the one
    bold element on the site.
