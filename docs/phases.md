# BuildLog --- Development Roadmap

## Phase 1 --- Project Foundation

### Objective

Create the application foundation and documentation structure.

### Tasks

-   [ ] Initialize Next.js + TypeScript application
-   [ ] Configure Tailwind CSS
-   [ ] Configure shadcn/ui
-   [ ] Install/configure Clerk
-   [ ] Configure Drizzle ORM
-   [ ] Connect PostgreSQL
-   [ ] Create `.env.example`
-   [ ] Add documentation files under `docs/`

### Files/Modules

-   `package.json`
-   `app/`
-   `components/`
-   `lib/`
-   `docs/`
-   configuration files

### Dependencies

None.

### Expected Result

Application starts locally with the intended stack and documentation
foundation.

### Completion Criteria

-   [ ] App runs locally
-   [ ] Database connection works
-   [ ] Clerk package/configuration is ready
-   [ ] Documentation exists

------------------------------------------------------------------------

## Phase 2 --- UI Foundation

### Objective

Build the visual foundation and shared application shell.

### Tasks

-   [ ] Configure design tokens
-   [ ] Build application layout
-   [ ] Build navbar/topbar
-   [ ] Build responsive sidebar
-   [ ] Build reusable cards
-   [ ] Build buttons and form controls
-   [ ] Build loading/empty/error states
-   [ ] Build landing page foundation

### Files/Modules

-   `app/globals.css`
-   `components/ui/`
-   `components/layout/`
-   `app/(marketing)/`

### Dependencies

Phase 1.

### Expected Result

A consistent responsive UI shell exists.

### Completion Criteria

-   [ ] Design system matches design.md
-   [ ] Desktop and mobile layouts work
-   [ ] Shared components are reusable

------------------------------------------------------------------------

## Phase 3 --- Authentication

### Objective

Implement Clerk authentication and protected routes.

### Tasks

-   [x] Configure Clerk
-   [x] Build sign-in route
-   [x] Build sign-up route
-   [x] Protect dashboard
-   [x] Display authenticated user
-   [x] Implement sign-out
-   [x] Verify server-side identity

### Files/Modules

-   `app/(auth)/`
-   `proxy.ts` if required (Next.js 16 renamed `middleware.ts` to
    `proxy.ts`; see memory.md)
-   `lib/auth/`
-   dashboard layout

### Dependencies

Phase 1--2.

### Expected Result

Only authenticated users can access private application areas.

### Completion Criteria

-   [x] Sign-in works
-   [x] Sign-up works
-   [x] Protected routes work
-   [x] Server can retrieve Clerk user ID

------------------------------------------------------------------------

## Phase 4 --- Database + Projects

### Objective

Create the database foundation and project management.

### Tasks

-   [x] Create database schema
-   [x] Create migrations
-   [x] Add project queries
-   [x] Create project form
-   [x] List projects
-   [x] Project detail page
-   [x] Edit project
-   [x] Delete project
-   [x] Enforce ownership

### Files/Modules

-   `lib/db/`
-   `lib/validations/`
-   `app/actions/projects.ts`
-   `components/projects/`
-   project routes

### Dependencies

Phase 3.

### Expected Result

Users can securely manage their own projects.

### Completion Criteria

-   [x] CRUD works
-   [x] Ownership is enforced
-   [x] Database migrations work

------------------------------------------------------------------------

## Phase 5 --- Tasks + Development Logs

### Objective

Implement the core developer activity workflow.

### Tasks

-   [x] Create tasks
-   [x] Update task status
-   [x] Edit/delete tasks
-   [x] Add development logs
-   [x] Edit/delete logs
-   [x] Display chronological logs
-   [x] Add activity tracking
-   [x] Calculate basic progress

### Files/Modules

-   `app/actions/tasks.ts`
-   `app/actions/dev-logs.ts`
-   `components/tasks/`
-   `components/dev-logs/`
-   database schema updates if required

### Dependencies

Phase 4.

### Expected Result

A user can actively track development work inside a project.

### Completion Criteria

-   [x] Tasks work end-to-end
-   [x] Logs work end-to-end
-   [x] Project progress is accurate
-   [x] Authorization is enforced

------------------------------------------------------------------------

## Phase 6 --- AI Features

### Objective

Add useful AI analysis without expanding scope unnecessarily.

### Tasks

-   [x] Configure server-side Gemini integration
-   [x] Create AI service
-   [x] Implement development log analysis
-   [x] Generate project report
-   [x] Validate/normalize AI output
-   [x] Store useful AI insights
-   [x] Handle AI errors gracefully

### Files/Modules

-   `lib/ai/`
-   `app/actions/ai.ts`
-   `components/ai/`

### Dependencies

Phase 5.

### Expected Result

AI provides contextual analysis based on real project data.

### Completion Criteria

-   [x] Log analysis works
-   [x] Project report works
-   [x] API key remains server-side
-   [x] AI failures are handled

------------------------------------------------------------------------

## Phase 7 --- Dashboard + Ship Score

### Objective

Turn project data into a clear decision-oriented dashboard.

### Tasks

-   [ ] Build dashboard overview
-   [ ] Project statistics
-   [ ] Recent activity
-   [ ] Latest AI insight
-   [ ] Implement transparent Ship Score
-   [ ] Add project health indicators
-   [ ] Polish project overview

### Files/Modules

-   `app/dashboard/`
-   `components/dashboard/`
-   analytics/calculation utilities

### Dependencies

Phase 5--6.

### Expected Result

Users immediately understand project status and what to do next.

### Completion Criteria

-   [ ] Dashboard is useful at a glance
-   [ ] Calculations are correct
-   [ ] Ship Score is understandable
-   [ ] Responsive layout works

------------------------------------------------------------------------

## Phase 8 --- Testing + Security

### Objective

Stabilize the application before deployment.

### Tasks

-   [ ] Test authentication
-   [ ] Test ownership boundaries
-   [ ] Test project CRUD
-   [ ] Test task CRUD
-   [ ] Test logs
-   [ ] Test validation
-   [ ] Test AI failures
-   [ ] Check environment variables
-   [ ] Check responsive behavior
-   [ ] Check accessibility
-   [ ] Fix critical bugs

### Dependencies

Phase 7.

### Expected Result

A stable production candidate.

### Completion Criteria

-   [ ] Critical flows pass
-   [ ] No known critical security issue
-   [ ] No exposed secrets
-   [ ] Major responsive/accessibility issues fixed

------------------------------------------------------------------------

## Phase 9 --- Deployment

### Objective

Deploy BuildLog and verify production functionality.

### Tasks

-   [ ] Configure production PostgreSQL
-   [ ] Configure Vercel environment variables
-   [ ] Run production migrations
-   [ ] Deploy
-   [ ] Test authentication in production
-   [ ] Test database operations
-   [ ] Test AI
-   [ ] Test critical user journey
-   [ ] Record deployment status

### Dependencies

Phase 8.

### Expected Result

BuildLog is publicly accessible and functional.

### Completion Criteria

-   [ ] Production deployment succeeds
-   [ ] Authentication works
-   [ ] Database works
-   [ ] AI works
-   [ ] Critical journey works end-to-end

------------------------------------------------------------------------

## Phase 10 --- Post-MVP

### Objective

Only after MVP is stable, evaluate additional features.

### Candidate Tasks

-   [ ] GitHub integration
-   [ ] Learning summary
-   [ ] Public project pages
-   [ ] Advanced analytics
-   [ ] Project streaks
-   [ ] Team collaboration

### Rule

Do not start these features until MVP deployment is stable and the
feature has a clear product reason.
