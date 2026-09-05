# BuildLog --- Design System

## 1. Design Philosophy

BuildLog should feel like a premium developer tool: - Focused -
Technical - Calm - Modern - Information-dense without feeling
cluttered - AI-enhanced without looking like an AI gimmick

The interface should prioritize project status, developer activity, and
actionable insights.

## 2. Visual Direction

Recommended visual language: - Dark-first developer workspace - Subtle
borders - Elevated cards - Strong typography hierarchy - Minimal
gradients - Restrained accent usage - Clear status indicators

## 3. Color Palette

### Background

-   Primary: `#09090B`
-   Secondary: `#111113`
-   Surface: `#18181B`
-   Elevated surface: `#202023`

### Text

-   Primary: `#FAFAFA`
-   Secondary: `#A1A1AA`
-   Muted: `#71717A`

### Borders

-   Default: `#27272A`
-   Strong: `#3F3F46`

### Accent

Primary accent: violet/purple family.

Recommended: - Primary: `#8B5CF6` - Primary hover: `#7C3AED`

### Semantic

-   Success: green
-   Warning: amber
-   Error: red
-   Info: blue

Semantic colors should be used sparingly and must not be the only status
indicator.

## 4. Typography

### Font

Use a modern sans-serif such as **Inter**.

Optional monospace: **JetBrains Mono** for code/technical metadata.

### Scale

-   Display: 40--48px
-   H1: 32px
-   H2: 24px
-   H3: 20px
-   Body: 14--16px
-   Small: 12--13px

### Weights

-   Regular: 400
-   Medium: 500
-   Semibold: 600
-   Bold: 700

## 5. Spacing System

Use a consistent 4px base scale: - 4 - 8 - 12 - 16 - 20 - 24 - 32 - 40 -
48 - 64

Avoid arbitrary spacing values.

## 6. Border Radius

-   Small controls: 6px
-   Inputs/buttons: 8px
-   Cards: 12px
-   Large containers: 16px
-   Pills: 9999px

## 7. Shadows

Use subtle shadows only for elevated elements. Avoid heavy glow effects.

## 8. Buttons

### Primary

Solid accent background with high-contrast text.

### Secondary

Surface background with border.

### Ghost

Transparent until hover.

### Destructive

Use semantic error styling only for destructive actions.

All buttons require: - Hover state - Focus state - Disabled state -
Loading state where applicable

## 9. Cards

Cards should: - Use consistent padding - Have subtle borders - Avoid
excessive decoration - Clearly separate primary information from
metadata

## 10. Inputs

Inputs should have: - Label - Clear placeholder where useful - Focus
state - Validation state - Error message when invalid

Never rely on placeholder text as the only label.

## 11. Navbar / Topbar

Desktop: - Application identity - Current context - User menu

Mobile: - Compact header - Menu trigger when sidebar is collapsed

## 12. Sidebar

Desktop sidebar: - Dashboard - Projects - Activity - Settings

Active navigation item must be visually distinct.

Mobile sidebar becomes a drawer/sheet.

## 13. Tables

Avoid tables when cards communicate information better.

For genuinely tabular data: - Clear column labels - Row hover -
Responsive overflow or mobile card transformation - Adequate touch
targets

## 14. Modals

Use modals for: - Confirm destructive actions - Focused creation/edit
flows when appropriate

Do not use modals for complex multi-step workflows.

## 15. Badges

Use badges for: - Status - Priority - AI-generated labels - Project
state

Keep badge text short.

## 16. Icons

Use one consistent icon library, preferably Lucide.

Icons should support meaning, not replace necessary text.

## 17. Loading States

Use: - Skeletons for page/card loading - Spinners for short action
loading - Disabled controls during mutations

Avoid blank screens.

## 18. Empty States

Every important empty state should explain: 1. What is empty. 2. Why it
matters. 3. What the user can do next.

Example:
`No projects yet → Create your first project to start tracking your build.`

## 19. Error States

Errors should: - Explain the problem simply - Suggest a next action
where possible - Never expose technical secrets or stack traces

## 20. Hover / Focus

Interactive elements should have clear hover and keyboard focus states.

## 21. Animations

Use subtle animations only: - 150--250ms transitions - Fade/slide for
panels - Progress transitions - Skeleton shimmer if appropriate

Avoid excessive animation because BuildLog is a productivity tool.

## 22. Responsive Breakpoints

Use Tailwind defaults unless a concrete requirement needs otherwise: -
Mobile: \<640px - Small tablet: 640px+ - Tablet: 768px+ - Desktop:
1024px+ - Large desktop: 1280px+

## 23. Mobile Rules

-   Sidebar collapses.
-   Cards become single-column.
-   Controls remain touch-friendly.
-   Project stats wrap naturally.
-   Task board may become vertically stacked sections.
-   Development logs remain easy to scan.
-   Avoid horizontal page scrolling.

## 24. Dashboard Hierarchy

``` text
Dashboard
 ├── Greeting / context
 ├── Key project metrics
 ├── Active projects
 ├── Recent activity
 └── AI insight
```

The most actionable information should appear first.

## 25. AI UI Rules

AI-generated content must be visually identifiable but not overwhelming.

Use a consistent AI indicator and label such as: `AI Insight`

AI output should always show context where useful, such as the source
project or development log.
