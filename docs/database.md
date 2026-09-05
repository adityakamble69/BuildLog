# BuildLog --- Database Design

## 1. Database Technology

**PostgreSQL, hosted on Supabase**

Supabase is used purely as a managed Postgres host for this project.
BuildLog does not use Supabase Auth, Supabase Storage, or Supabase
Realtime --- Clerk remains the only authentication provider (see
Section 4).

## 1.1 Supabase Connection Model

Supabase exposes two connection paths to the same database:

-   **Connection Pooler (Transaction mode, port 6543)** --- required for
    serverless/edge runtimes (Vercel functions). Used by the running
    application (`DATABASE_URL`).
-   **Direct Connection (port 5432)** --- a persistent, non-pooled
    connection. Used only for running migrations (`DIRECT_URL`), since
    DDL and long-lived migration sessions are safer outside transaction
    pooling.

Transaction-mode pooling does not support prepared statements. The
`postgres` (postgres.js) driver is used with `prepare: false` for this
reason --- see Section 15.

## 2. Database Name

Recommended local/development database name:

`buildlog`

Production database name is provider-dependent.

## 3. ORM

**Drizzle ORM**

## 4. Identity Model

Clerk is the identity provider. The database stores the Clerk user ID as
the application ownership key.

No passwords or authentication secrets are stored in PostgreSQL.

## 5. Tables

### projects

  Column        Type             Required Default     Notes
  ------------- -------------- ---------- ----------- ---------------------------
  id            uuid                  Yes generated   Primary key
  user_id       varchar               Yes ---         Clerk user ID
  name          varchar(120)          Yes ---         Project name
  description   text                   No null        Project description
  status        varchar               Yes `active`    active/completed/archived
  created_at    timestamptz           Yes now()       Creation time
  updated_at    timestamptz           Yes now()       Last update

### tasks

  Column        Type             Required Default     Notes
  ------------- -------------- ---------- ----------- -----------------------
  id            uuid                  Yes generated   Primary key
  project_id    uuid                  Yes ---         FK projects.id
  title         varchar(200)          Yes ---         Task title
  description   text                   No null        Details
  status        varchar               Yes `todo`      todo/in_progress/done
  priority      varchar               Yes `medium`    low/medium/high
  due_date      date                   No null        Optional
  created_at    timestamptz           Yes now()       Creation time
  updated_at    timestamptz           Yes now()       Last update

### dev_logs

  Column       Type            Required Default     Notes
  ------------ ------------- ---------- ----------- -------------------
  id           uuid                 Yes generated   Primary key
  project_id   uuid                 Yes ---         FK projects.id
  user_id      varchar              Yes ---         Clerk user ID
  content      text                 Yes ---         Development entry
  created_at   timestamptz          Yes now()       Creation time
  updated_at   timestamptz          Yes now()       Last update

### ai_insights

  Column       Type            Required Default     Notes
  ------------ ------------- ---------- ----------- ----------------------
  id           uuid                 Yes generated   Primary key
  project_id   uuid                 Yes ---         FK projects.id
  dev_log_id   uuid                  No null        Optional source log
  type         varchar              Yes ---         log_analysis/report
  content      jsonb                Yes ---         Structured AI result
  created_at   timestamptz          Yes now()       Creation time

### activity_logs

  Column       Type             Required Default     Notes
  ------------ -------------- ---------- ----------- ---------------------
  id           uuid                  Yes generated   Primary key
  project_id   uuid                  Yes ---         FK projects.id
  user_id      varchar               Yes ---         Clerk user ID
  action       varchar(100)          Yes ---         e.g. task_completed
  metadata     jsonb                  No null        Optional details
  created_at   timestamptz           Yes now()       Activity time

## 6. Relationships

``` text
Clerk User
   │
   ├── 1:N → projects
   │
   └── 1:N → dev_logs

projects
   ├── 1:N → tasks
   ├── 1:N → dev_logs
   ├── 1:N → ai_insights
   └── 1:N → activity_logs

dev_logs
   └── 1:N → ai_insights (optional)
```

## 7. Foreign Keys

-   tasks.project_id → projects.id
-   dev_logs.project_id → projects.id
-   ai_insights.project_id → projects.id
-   ai_insights.dev_log_id → dev_logs.id
-   activity_logs.project_id → projects.id

Use cascading behavior carefully. Deleting a project may cascade to its
dependent tasks/logs/insights/activity records because they have no
independent meaning outside the project.

## 8. Constraints

-   Project name must not be empty.
-   Task title must not be empty.
-   Development log content must not be empty.
-   Project status restricted to defined values.
-   Task status restricted to defined values.
-   Priority restricted to defined values.
-   Foreign keys must reference existing records.
-   UUID primary keys must be generated server-side/database-side.

## 9. Indexes

Recommended: - projects(user_id) - projects(user_id, status) -
tasks(project_id) - tasks(project_id, status) - dev_logs(project_id,
created_at) - ai_insights(project_id, created_at) -
activity_logs(project_id, created_at)

These support common dashboard/project queries.

## 10. Unique Fields

No global project-name uniqueness is required.

If a uniqueness constraint is later introduced, it should be scoped to
the owner rather than globally.

## 11. Important Queries

### User projects

Find projects where `user_id = currentClerkUserId`.

### Project tasks

Find tasks by project ID after verifying project ownership.

### Recent development

Find development logs for a project ordered by `created_at DESC`.

### Project progress

Calculate:

`completed tasks / total tasks * 100`

Handle zero-task projects explicitly.

### Recent activity

Find activity records for a project ordered newest-first.

## 12. Seed Data

Development seed data should include: - 1--2 demo users represented by
safe placeholder Clerk IDs - 2 demo projects - Several tasks in
different statuses - Several development logs - Example AI insights

Seed data must never contain real credentials or production user data.

## 13. Database Security

-   Never expose direct database credentials to the browser.
-   All DB access runs server-side.
-   Authorize ownership before queries/mutations.
-   Validate input before database writes.
-   Use parameterized/ORM-generated queries.
-   Store only required data.
-   Do not store passwords.
-   Do not store Clerk secrets in the database.

## 14. Data Retention

MVP does not require automated data deletion or archival. If introduced
later, document retention policy before implementation.

## 15. Driver Configuration (Supabase)

-   Use the `postgres` (postgres.js) driver via
    `drizzle-orm/postgres-js`, not `pg`/node-postgres.
-   The application client sets `prepare: false`, since Supabase's
    Transaction-mode pooler does not support prepared statements.
-   `DATABASE_URL` (pooler, port 6543) is used at runtime.
-   `DIRECT_URL` (direct connection, port 5432) is used only by
    `drizzle-kit` for generating/running migrations.
-   Never use the direct connection for application runtime queries in
    a serverless environment --- it will exhaust Postgres connection
    limits under load.
