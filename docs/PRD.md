# DevTrace --- Product Requirements Document

## 1. Project Name

**DevTrace**

## 2. Project Overview

DevTrace is an AI-powered development journal and project tracker for
developers. Users create projects, manage tasks, record development
logs, and use AI to analyze their work, identify blockers, summarize
progress, and recommend next steps.

The MVP is intentionally focused on helping a solo developer understand
project progress and development activity while demonstrating meaningful
Clerk authentication and AI functionality.

## 3. Problem Statement

Developers frequently build projects without keeping a useful record of
what they completed, what they learned, what is blocking them, or what
they should do next. Traditional task trackers capture checkboxes but
often miss the reasoning and learning behind development work.

## 4. Goal

Build a focused developer workspace that combines: - Project tracking -
Task management - Development journaling - AI-powered analysis -
Progress insights - Ship/readiness feedback

The primary MVP goal is to deliver a working product that can be
demonstrated and deployed within a one-day builder event.

## 5. Target Users

-   Solo developers
-   Students building software projects
-   Indie hackers
-   Developers maintaining side projects
-   Developers learning through projects

## 6. User Roles

### User

-   Sign in/sign out
-   Create and manage own projects
-   Create and manage tasks
-   Create development logs
-   Generate AI analysis
-   View project progress and insights
-   Delete own project data

### Admin

Minimal MVP administration only. Admin capabilities should not expand
the MVP scope unnecessarily.

Potential responsibilities: - View basic platform statistics - Review
reported/problematic content if moderation becomes necessary

## 7. Core Features

### 7.1 Authentication

-   Clerk sign-up
-   Clerk sign-in
-   Sign-out
-   Protected application routes
-   User profile through Clerk

### 7.2 Projects

-   Create project
-   View projects
-   View project details
-   Edit project
-   Delete project
-   Set project status
-   Track project progress

### 7.3 Tasks

-   Create task
-   Edit task
-   Delete task
-   Change task status
-   Set priority
-   Optional due date
-   Display completed vs pending tasks

### 7.4 Development Logs

-   Create development log
-   View chronological logs
-   Edit/delete own logs
-   Associate logs with a project
-   Add lightweight metadata/tags where useful

### 7.5 AI Log Analysis

Given a development log, AI can: - Summarize what was accomplished -
Identify possible blockers or risks - Suggest next actions - Detect
relevant technical topics

### 7.6 AI Project Report

AI can analyze recent project activity and generate: - Progress
summary - Major accomplishments - Potential blockers - Recommended next
steps

### 7.7 Dashboard

Display: - Active projects - Project progress - Task completion - Recent
development activity - Latest AI insight

### 7.8 Ship Score

A simple readiness indicator based on measurable project information
such as: - Task completion - Recent development activity - Optional
testing/documentation indicators

The score must remain understandable and should not pretend to be a
scientific measurement.

## 8. Functional Requirements

### Authentication

-   Unauthenticated users must not access protected application data.
-   Every authenticated request involving project data must verify
    ownership.
-   Clerk is the authentication authority.

### Project Management

-   A user can create multiple projects.
-   Project names are required.
-   Projects belong to exactly one application user.
-   Users can only modify their own projects.

### Task Management

-   Tasks belong to a project.
-   Tasks cannot be accessed through a project the current user does not
    own.
-   Task status must use a defined set of values.

### Development Logs

-   Logs must belong to a project and user.
-   Logs must have non-empty content.
-   Logs are shown newest-first by default.

### AI

-   AI calls must execute server-side.
-   API credentials must never reach the browser.
-   AI failures must not corrupt project data.
-   AI-generated content must be clearly identified as generated
    insight.

## 9. Non-Functional Requirements

-   Responsive on desktop, tablet, and mobile.
-   Fast initial dashboard rendering.
-   Secure server-side authorization.
-   Input validation on server boundaries.
-   Clear error and loading states.
-   Accessible interactive controls.
-   Maintainable TypeScript codebase.
-   Minimal unnecessary dependencies.
-   Deployable to Vercel.
-   PostgreSQL-backed persistent data.

## 10. Pages / Screens

-   Landing page
-   Sign in
-   Sign up
-   Dashboard
-   Projects list
-   Create project
-   Project details
-   Tasks view
-   Development logs view
-   AI insights/report view
-   Settings
-   Minimal admin area only if administration is required

## 11. User Journeys

### New User

Landing → Sign up with Clerk → Dashboard → Create Project → Add Tasks →
Add Development Log → Generate AI Analysis.

### Returning User

Sign in → Dashboard → Open Project → Review tasks/logs → Continue
development → Generate updated insights.

### Project Completion

Project → Complete tasks → Review development activity → Generate AI
report → Review readiness/Ship Score → Deploy project.

## 12. Authentication Requirements

-   Use Clerk.
-   No custom password storage.
-   Protect application routes.
-   Use Clerk user ID as the stable application identity.
-   Verify authenticated identity on server-side data operations.

## 13. Admin Requirements

MVP admin functionality is intentionally minimal. Do not build a large
administration system unless a concrete requirement appears.

## 14. API Requirements

Use Next.js Server Actions and/or Route Handlers.

Required operations: - Project CRUD - Task CRUD - Development log CRUD -
AI log analysis - AI project report - Dashboard/project statistics

All protected operations must authenticate and authorize the current
user.

## 15. Notifications

No push/email notification system is required for MVP.

In-app feedback such as success/error toasts may be used.

## 16. Integrations

Required: - Clerk - PostgreSQL - Gemini API

Deployment: - Vercel

Optional future integration: - GitHub

## 17. Future Features

-   GitHub repository/commit integration
-   Automatic activity ingestion
-   AI-generated learning summaries
-   Public project pages
-   Project streaks
-   Advanced analytics
-   Team collaboration
-   AI-assisted task planning
-   Exportable reports
-   Email notifications

## 18. Out of Scope

-   Full Jira/Linear replacement
-   Real-time collaborative editing
-   Payments
-   Marketplace
-   Mobile native applications
-   Complex RBAC
-   Custom authentication
-   Social network functionality
-   Full GitHub automation in MVP
-   Advanced ML model training
-   Large-scale notification infrastructure

## 19. MVP Success Criteria

The MVP is successful when an authenticated user can: 1. Create a
project. 2. Add and complete tasks. 3. Record development activity. 4.
Ask AI to analyze a development log. 5. Generate a project report. 6.
See project progress. 7. Access only their own data. 8. Use the deployed
application successfully.
