# DevTrace --- Development Rules

These rules apply to all human and AI development work.

## 1. Source of Truth

The documentation in `docs/` is authoritative.

Before implementing a feature: 1. Check PRD.md. 2. Check
architecture.md. 3. Check database.md when data is involved. 4. Check
rules.md. 5. Check design.md for UI. 6. Check phases.md. 7. Check
memory.md.

## 2. General DO / DON'T

### DO

-   Reuse existing components and utilities.
-   Keep changes focused.
-   Validate inputs at server boundaries.
-   Handle errors explicitly.
-   Keep TypeScript strict.
-   Document architecture/schema changes.
-   Update memory.md after meaningful progress.
-   Keep the MVP scope controlled.
-   Prefer simple solutions over premature abstraction.

### DON'T

-   Hardcode secrets.
-   Expose API keys.
-   Duplicate functionality.
-   Rewrite working files unnecessarily.
-   Install dependencies without a clear reason.
-   Change architecture without documentation.
-   Add features merely because they sound impressive.
-   Trust client-supplied ownership IDs.
-   Skip authorization checks.

## 3. Coding Standards

-   TypeScript for application code.
-   Avoid `any` unless there is a documented reason.
-   Prefer small, composable functions.
-   Keep business logic out of presentation components.
-   Use descriptive names.
-   Keep functions focused on one responsibility.

## 4. Naming Conventions

-   Components: PascalCase.
-   Functions/variables: camelCase.
-   Constants: UPPER_SNAKE_CASE only for true constants.
-   Files: follow framework convention; use kebab-case for general
    modules where practical.
-   Database tables/columns: snake_case.
-   Types/interfaces: PascalCase.

## 5. Folder Conventions

-   UI components → `components/`
-   Shared utilities → `lib/utils/`
-   Validation → `lib/validations/`
-   Database → `lib/db/`
-   AI logic → `lib/ai/`
-   Server actions → `app/actions/`
-   Documentation → `docs/`

Do not scatter domain logic across unrelated directories.

## 6. Component Rules

-   Build reusable UI components when repetition exists.
-   Prefer composition over duplicated variants.
-   Keep components accessible.
-   Keep client components limited to interactive requirements.
-   Do not create one-off abstractions for trivial markup.

## 7. API Rules

-   Authenticate protected operations.
-   Authorize resource ownership.
-   Validate request data.
-   Return predictable success/error structures.
-   Never expose internal secrets or stack traces.
-   Use appropriate HTTP status codes for Route Handlers.

## 8. Database Rules

-   Schema changes must be documented in database.md.
-   Use migrations.
-   Do not manually modify production schema without migration history.
-   Use foreign keys for real relationships.
-   Add indexes based on actual access patterns.
-   Avoid duplicate stored data.
-   Use transactions for operations requiring atomicity.

## 9. Security Rules

-   Secrets only in environment variables.
-   Never commit `.env.local`.
-   Keep `.env.example` updated without secret values.
-   Server-only credentials must never be imported into client
    components.
-   Verify Clerk identity server-side.
-   Check ownership before reading or mutating project resources.
-   Validate all user-controlled input.
-   Avoid rendering unsafe HTML.

## 10. Authentication Rules

-   Clerk is the only authentication provider for MVP.
-   Do not create custom password authentication.
-   Use the authenticated Clerk user ID as identity.
-   Never accept a browser-provided user ID as proof of ownership.

## 11. Environment Variables

Expected variables will include values such as: - Clerk publishable
key - Clerk secret key - Database URL - Gemini API key

Only public values may be exposed through client-safe environment
variables.

## 12. Error Handling

-   Show user-friendly errors.
-   Log useful server-side diagnostic information where appropriate.
-   Do not reveal secrets or internal stack traces.
-   AI failure must degrade gracefully.
-   Database failure must not result in misleading success messages.

## 13. Validation

Use Zod at server boundaries.

Validate: - Required strings - String lengths - Enum values - UUIDs -
Optional dates - AI request payloads where appropriate

Client validation can improve UX but never replaces server validation.

## 14. Responsive Design

Design mobile-first. - No horizontal scrolling for normal pages. -
Tables should adapt or become cards/scroll containers where necessary. -
Sidebar must collapse appropriately. - Buttons and touch targets must
remain usable.

## 15. Accessibility

-   Semantic HTML.
-   Visible focus states.
-   Keyboard-accessible interactions.
-   Form labels.
-   Meaningful button labels.
-   Do not use color as the only status indicator.
-   Maintain readable contrast.

## 16. Git/GitHub Rules

Use small, meaningful commits.

Recommended commit style: - `feat: add project creation` -
`fix: validate task ownership` - `refactor: extract project service` -
`docs: update database schema`

Do not commit secrets, generated credentials, or unnecessary build
artifacts.

## 17. Dependency Rules

Before adding a dependency: 1. Check whether the feature can be
implemented with existing tools. 2. Check whether
Next.js/TypeScript/browser APIs already solve it. 3. Add the dependency
only when it materially improves maintainability or functionality.

## 18. Performance

-   Prefer Server Components for data-heavy read views.
-   Avoid unnecessary client-side fetching.
-   Paginate or limit large activity/log lists when needed.
-   Avoid expensive AI calls on every page load.
-   Cache/revalidate where appropriate.
-   Do not optimize prematurely.

## 19. Testing

At minimum test: - Authentication protection - Ownership authorization -
Project CRUD - Task CRUD - Development log CRUD - Validation failures -
AI failure handling - Critical dashboard calculations

## 20. Architecture Change Rule

Any meaningful architecture change requires: 1. Identify why it is
needed. 2. Update architecture.md. 3. Update affected documentation. 4.
Record the decision in memory.md. 5. Then implement.
