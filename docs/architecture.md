# BuildLog --- System Architecture

## 1. Architecture Overview

BuildLog uses a modern full-stack Next.js architecture.

``` text
Browser
  ↓
Next.js App Router
  ↓
Server Components / Client Components
  ↓
Server Actions / Route Handlers
  ↓
Authentication + Authorization (Clerk)
  ↓
Domain Services
  ├── Project Service
  ├── Task Service
  ├── Development Log Service
  └── AI Service
  ↓
Drizzle ORM
  ↓
PostgreSQL
```

External AI requests:

``` text
BuildLog Server
      ↓
Gemini API
      ↓
AI result
      ↓
Validation / normalization
      ↓
Database / response
```

## 2. Application Flow

1.  User opens BuildLog.
2.  Public pages are available without authentication.
3.  Clerk handles sign-in/sign-up.
4.  Protected routes require an authenticated Clerk session.
5.  Server operations obtain the authenticated Clerk user ID.
6.  Application queries PostgreSQL using that identity.
7.  Ownership checks happen before protected mutations/read operations.
8.  AI operations execute server-side.
9.  UI receives validated results.

## 3. Frontend Architecture

Use Next.js App Router.

### Server Components

Use by default for: - Dashboard data - Project pages - Task lists -
Development log lists - Read-only reports

### Client Components

Use only where interaction requires browser state: - Forms - Task status
changes - Modals - Tabs - Interactive filters - AI generation controls

Avoid making entire pages client components unnecessarily.

## 4. Backend Architecture

Organize backend logic around domain responsibilities.

``` text
app/
  actions/
    projects.ts
    tasks.ts
    dev-logs.ts
    ai.ts

lib/
  auth/
  db/
  ai/
  validations/
  services/
```

Business logic should not be duplicated between pages and API handlers.

## 5. Database Architecture

PostgreSQL is the persistent source of truth.

Primary entities: - users/application identity reference - projects -
tasks - development logs - AI insights - activity logs

Clerk remains the source of truth for authentication identity.
Application tables store the Clerk user ID rather than duplicating
authentication credentials.

## 6. API Architecture

Prefer Server Actions for internal mutations when appropriate.

Route Handlers may be used for: - External/API-style access - AI
endpoints when useful - Future integrations

Conceptual endpoint structure:

``` text
/api/projects
/api/projects/[projectId]
/api/projects/[projectId]/tasks
/api/projects/[projectId]/logs
/api/projects/[projectId]/insights
/api/projects/[projectId]/report
```

All protected endpoints require authentication and authorization.

## 7. Authentication Flow

``` text
User
 ↓
Clerk Sign In
 ↓
Clerk Session
 ↓
Next.js Request
 ↓
Get Clerk User ID
 ↓
Authorize Resource
 ↓
Database Operation
```

Never trust a user ID supplied by the browser when the authenticated
session provides the authoritative identity.

## 8. Authorization

MVP authorization is ownership-based.

``` text
Authenticated User
       ↓
resource.user_id === currentClerkUserId
       ↓
YES → allow
NO  → deny
```

Projects are the primary ownership boundary. Tasks and logs inherit
authorization through their project.

## 9. Data Flow

### Create Project

``` text
Project Form
 ↓
Zod validation
 ↓
Server Action
 ↓
Clerk identity
 ↓
Insert project
 ↓
PostgreSQL
 ↓
Revalidate project/dashboard
```

### AI Log Analysis

``` text
Development Log
 ↓
Server Action
 ↓
Ownership check
 ↓
AI service
 ↓
Gemini
 ↓
Structured result
 ↓
Store insight if appropriate
 ↓
UI
```

## 10. External Services

-   Clerk --- authentication and identity
-   Gemini --- AI analysis
-   Supabase (PostgreSQL) --- database, accessed only via Drizzle ORM
    over Postgres --- no Supabase Auth/Storage/Realtime in MVP scope
-   Vercel --- deployment

## 11. Recommended Folder Structure

``` text
buildlog/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── projects/
│   │   └── settings/
│   ├── api/
│   │   └── ...
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── projects/
│   ├── tasks/
│   ├── dev-logs/
│   └── ai/
│
├── lib/
│   ├── auth/
│   ├── db/
│   │   ├── schema/
│   │   └── index.ts
│   ├── ai/
│   ├── validations/
│   └── utils/
│
├── drizzle/
├── public/
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── database.md
│   ├── rules.md
│   ├── phases.md
│   ├── design.md
│   └── memory.md
│
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 12. Component Structure

``` text
Dashboard
 ├── Sidebar
 ├── Topbar
 ├── ProjectOverview
 ├── ProjectProgress
 ├── RecentActivity
 └── AIInsightCard

ProjectDetails
 ├── ProjectHeader
 ├── ProjectStats
 ├── TaskBoard
 ├── DevLogList
 └── AIInsightPanel
```

Reuse shared components instead of creating visually or functionally
duplicate components.

## 13. Route Structure

``` text
/
 /sign-in
 /sign-up
 /dashboard
 /dashboard/projects
 /dashboard/projects/new
 /dashboard/projects/[projectId]
 /dashboard/projects/[projectId]/tasks
 /dashboard/projects/[projectId]/logs
 /dashboard/projects/[projectId]/insights
 /dashboard/settings
```

## 14. Important Technical Decisions

-   Next.js App Router for a unified frontend/backend application.
-   TypeScript for type safety.
-   Clerk instead of custom authentication.
-   PostgreSQL (hosted on Supabase) for relational project/task/log
    data.
-   Drizzle ORM with the `postgres` (postgres.js) driver --- required
    for compatibility with Supabase's Transaction-mode connection
    pooler (`prepare: false`).
-   Zod for server-boundary validation.
-   Server-side AI calls.
-   Ownership-based authorization.
-   Server Components by default.
-   Tailwind + shadcn/ui for consistent UI.
-   Vercel for deployment.
-   Keep MVP architecture modular but avoid premature microservices.

## 15. Scalability Strategy

For MVP, use a modular monolith.

``` text
One Next.js Application
        │
   Domain Modules
        │
   PostgreSQL
        │
 External AI Service
```

Only consider service extraction when real scaling requirements justify
it.
