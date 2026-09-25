# DevTrace

DevTrace is an AI-powered development journal and project tracker built for solo developers, students, and indie hackers. It combines project tracking, task management, and development logging with AI-generated insights — so you get credit for the reasoning and learning behind your work, not just checked-off boxes.

Built with Next.js (App Router), Drizzle ORM, PostgreSQL, and Clerk authentication, with Google's Gemini API powering the AI features.

## Features

- **Projects** — create, edit, and track projects with status and progress
- **Tasks** — a task board with priority, due dates, and status tracking per project
- **Dev logs** — chronological development journal entries tied to a project
- **AI log analysis** — summarizes what was accomplished, flags possible blockers, and suggests next actions from a dev log
- **AI project reports** — progress summaries, accomplishments, blockers, and recommended next steps generated from recent project activity
- **Dashboard** — active projects, task completion, recent activity, and the latest AI insight at a glance
- **Ship Score** — a simple, transparent readiness indicator based on task completion and recent activity
- **Auth** — full sign-up/sign-in/sign-out and protected routes via Clerk

## Tech stack

| Layer          | Technology                          |
| -------------- | ------------------------------------ |
| Framework      | Next.js 16 (App Router), React 19    |
| Language       | TypeScript                           |
| Styling        | Tailwind CSS, shadcn/ui, Radix UI    |
| Database       | PostgreSQL via Drizzle ORM           |
| Auth           | Clerk                                |
| AI             | Google Gemini API                    |
| Validation     | Zod                                  |
| Testing        | Node's built-in test runner (`tsx`)  |

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Supabase](https://supabase.com))
- A [Clerk](https://clerk.com) application (for auth)
- A [Gemini API key](https://ai.google.dev/) (for AI features)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable                        | Description                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`                  | PostgreSQL connection string (pooled, e.g. Supabase transaction pooler)     |
| `DIRECT_URL`                    | Direct (non-pooled) PostgreSQL connection string, used for migrations        |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                                                    |
| `CLERK_SECRET_KEY`              | Clerk secret key                                                             |
| `GEMINI_API_KEY`                | Google Gemini API key, used server-side only                                 |
| `GITHUB_CLIENT_ID`              | GitHub OAuth app client ID (if GitHub integration is enabled)                |
| `GITHUB_CLIENT_SECRET`          | GitHub OAuth app client secret                                               |
| `GITHUB_TOKEN_ENCRYPTION_KEY`   | Key used to encrypt stored GitHub tokens                                     |

> Note: the pooled `DATABASE_URL` connection (e.g. Supabase's transaction-mode pooler on port 6543) does not support prepared statements — this is already handled in `lib/db/index.ts`. See `docs/database.md` for details.

### 3. Set up the database

```bash
npm run db:generate   # generate Drizzle migrations from schema changes
npm run db:migrate    # apply migrations
npm run db:studio     # optional: browse the database with Drizzle Studio
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script               | Description                            |
| --------------------- | --------------------------------------- |
| `npm run dev`         | Start the development server            |
| `npm run build`       | Build for production                    |
| `npm run start`       | Start the production server             |
| `npm run lint`        | Run ESLint                              |
| `npm run test`        | Run the test suite (`tests/*.test.ts`)  |
| `npm run db:generate` | Generate Drizzle migrations             |
| `npm run db:migrate`  | Apply Drizzle migrations                |
| `npm run db:studio`   | Open Drizzle Studio                     |

## Project structure

```
app/
  (marketing)/        # Public landing page
  (auth)/              # Clerk sign-in / sign-up
  dashboard/           # Authenticated app: projects, tasks, logs, settings, activity
  p/[id]/              # Public/shared project view
  actions/             # Server actions (projects, tasks, dev-logs, ai, activity, dashboard, search)
components/
  ai/                  # AI insight cards, log analysis, project report views
  projects/ tasks/ dev-logs/   # Feature UI
  dashboard/ analytics/        # Dashboard widgets, charts, heatmaps
  layout/ ui/                  # App shell, nav, shadcn/ui primitives
lib/
  ai/                  # Gemini client + AI analysis logic
  db/                  # Drizzle client and schema
  validations/         # Zod schemas
  utils/               # Ship Score, streak calculations
drizzle/               # SQL migrations and schema snapshots
docs/                  # PRD, architecture, database, and design docs
tests/                 # Unit tests
```

## Architecture

DevTrace follows a standard Next.js App Router flow: Server/Client Components → Server Actions → Clerk auth check → domain service → Drizzle ORM → PostgreSQL. AI requests are made server-side only through a thin Gemini client (`lib/ai/client.ts`); API credentials never reach the browser, and AI failures degrade gracefully without corrupting project data.

See `docs/architecture.md`, `docs/database.md`, and `docs/PRD.md` for the full design and requirements.

## Security notes

- All protected routes require an authenticated Clerk session.
- Every project/task/log mutation verifies resource ownership server-side before executing.
- AI and database credentials are read only in server-side modules and are never exposed to the client.

## Deployment

DevTrace is designed to deploy on [Vercel](https://vercel.com) with a PostgreSQL provider such as Supabase. Set the environment variables listed above in your deployment platform, then run migrations against the production database before your first deploy.

## License

Add a license for this project (e.g. MIT) if you intend to open-source it.
