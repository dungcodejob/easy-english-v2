# HTML Design → React UI Refactor Spec

**Date:** 2026-04-13
**Status:** Approved
**Scope:** Full visual restyling of all React pages to match HTML mockup designs

## Context

The Easy English V2 project has 18 HTML mockup designs in `tmp/` that define the target UI. The React app already has working logic and data fetching — this is a pure visual restyling effort. The existing design system (`shared/ui/design-tokens/`, `shared/ui/base/`, Shadcn components) provides a solid foundation that will be updated, not replaced.

## Design System: Material Design 3 Scholarly Theme

### Color Palette (CSS Variables in globals.css)

Map from current neutral grayscale to MD3 scholarly palette:

| Variable | Current | Target | Notes |
|----------|---------|--------|-------|
| `--primary` | `oklch(0.205 0 0)` (black) | `#002046` (deep navy) | Brand primary |
| `--secondary` | `oklch(0.97 0 0)` (gray) | `#006b5e` (teal green) | Success/learning |
| `--background` | `oklch(1 0 0)` (white) | `#faf9fd` (warm white) | Page background |
| `--sidebar` | `oklch(0.985 0 0)` | `#f4f3f7` (light gray) | Sidebar background |
| `--border` | `oklch(0.922 0 0)` | `#c4c6cf` (outline-variant) | Borders |

New variables to add:

| Variable | Value | Purpose |
|----------|-------|---------|
| `--primary-container` | `#1b365d` | Gradient endpoint, sidebar active |
| `--secondary-container` | `#94f0df` | Learning success highlights |
| `--tertiary` | `#311d00` | Amber/gold accent base |
| `--tertiary-fixed-dim` | `#ffb954` | Progress bars, streaks |
| `--surface` | `#faf9fd` | Main surface |
| `--surface-container-low` | `#f4f3f7` | Sidebar, subtle backgrounds |
| `--surface-container` | `#efedf1` | Card backgrounds |
| `--surface-container-high` | `#e9e7eb` | Elevated surfaces |
| `--surface-container-highest` | `#e3e2e6` | Highest elevation |
| `--on-surface` | `#1a1b1e` | Text on surfaces |
| `--on-surface-variant` | `#44474e` | Secondary text |
| `--outline` | `#74777f` | Borders, dividers |
| `--outline-variant` | `#c4c6cf` | Subtle borders |

### Typography

- **Headlines**: `Lexend` — weights 300-800, used for page titles, nav labels, stat numbers
- **Body**: `Be Vietnam Pro` — weights 300-600, used for body text, descriptions, labels
- **CSS**: Add `--font-headline: 'Lexend', sans-serif` and `.font-headline` utility
- **Update**: `--font-sans` → `'Be Vietnam Pro', sans-serif`, `--font-display` → `'Lexend', sans-serif`

### Border Radius

| Token | Current | Target |
|-------|---------|--------|
| `--radius` | `0.625rem` (10px) | `1rem` (16px) |
| `--radius-lg` | calc × 1 | `2rem` (32px) |
| `--radius-xl` | calc × 1.4 | `3rem` (48px) |
| `--radius-full` | — | `9999px` (pills) |

### Design Token TypeScript Updates

- `colors.ts` — add `surface`, `tertiary`, `onSurface`, `onSurfaceVariant`, `outline` groups
- `typography.ts` — add `fontFamily.headline` mapping to `var(--font-headline)`
- `radius.ts` — update values to match new radius scale

## Implementation Order

### Step 0: Design Tokens & Tailwind Theme

**Files:**
- `client/src/styles/globals.css` — update `:root` and `.dark` CSS variables, add new MD3 variables, update `@theme inline` mappings, add font imports for Lexend and Be Vietnam Pro
- `client/src/shared/ui/design-tokens/colors.ts` — add surface hierarchy + tertiary tokens
- `client/src/shared/ui/design-tokens/typography.ts` — add `fontFamily.headline`
- `client/src/shared/ui/design-tokens/radius.ts` — update radius scale values

### Step 1: Layout Shell (Sidebar + Header + Content)

**Sidebar** (`client/src/modules/shell/components/app-sidebar.tsx`):
- Background: `#f4f3f7` with `rounded-r-3xl` (right side rounded)
- Active nav item: pill shape (`rounded-full`) with navy gradient (`#002046 → #1b365d`) + `shadow-lg`
- Inactive items: pill shape with hover `bg-surface-variant`
- Remove grouped sections (Priority/Learning/Progress) → flat nav list
- Header: workspace icon with navy gradient + workspace name + level badge
- Footer: Settings + Help pinned to bottom with border-top
- Overall: `shadow-xl`, `py-8` padding, `w-64` width
- Font: Lexend for nav item labels via `.font-headline`

**Nav Group** (`client/src/modules/shell/ui/nav-group.tsx`):
- Restyle items to pill shape with icon + label layout
- Active state: gradient background, white text, shadow, slight scale
- Hover state: `bg-surface-container-high` with transition

**Header** (`client/src/modules/shell/components/app-header.tsx`):
- Glass effect: `bg-surface/80 backdrop-blur-xl`
- Shadow: `shadow-[0_12px_32px_rgba(26,27,30,0.06)]`
- Left: workspace name in bold navy Lexend
- Right: pill-shaped search bar + simplified icon buttons (rounded-full)
- Simplify from 4 icon buttons (mode, language, activity, notifications) to search + essential actions

**Authenticated Layout** (`client/src/modules/shell/pages/authenticated-layout.tsx`):
- Content area: adjust padding for fixed sidebar offset
- Background: `bg-surface`
- Keep `SidebarProvider` + `SidebarInset` structure

**Study Session Header** (`client/src/modules/learning/components/study-session-header.tsx`) — NEW:
- Close button (X) with rounded-full surface-container-low background
- Workspace name in Lexend bold navy
- Streak badge: `bg-orange-100 text-orange-700` pill with fire emoji
- Session type label
- Timer badge: `bg-surface-container-high` pill
- Progress bar: `bg-surface-container-highest` track, `bg-tertiary-fixed-dim` fill with glow shadow
- Counter: `current / total` in Lexend semibold

### Step 2: Dashboard

**File:** `client/src/modules/dashboard/pages/dashboard-page.tsx` + dashboard components

- Hero section: Lexend `text-5xl font-extrabold` heading + subtitle with highlighted word count
- Quick Start CTA: pill button with navy gradient + play icon
- 3-column stat cards: Study Streak (large number), Words Due (count + source), Daily Goal (circular progress with percentage)
- Learning Progress: bar chart with Learned vs Mastered legend
- Recent Topics: list with progress bars and word counts
- Bottom CTA banner: full-width card with background image + overlay gradient + text

### Step 3: Study Hub

**File:** `client/src/modules/learning/pages/my-learning.page.tsx` + new components

- Hero: "Easy English Study Hub" in large Lexend + "Current Status: Resume Last Session" pill
- Words Due Today CTA: rounded card with teal gradient, vocabulary/phrases counts, Start Review button
- Bento grid: Daily Review (large card with typewriter image), Speed Quiz (small card with weekly progress)
- Study by Topic: card with category list (Professional, Gastronomy, Travel Logistics) + "Explore all" link
- Milestone card: achievement with "View Certificate" CTA
- Bottom: inspirational quote + dual CTA buttons (Start Study Hub, View Mastery Map)
- Floating "New Session" button pinned to sidebar bottom area

### Step 4: Study Sessions (6 modes)

**Files:**
- `client/src/modules/learning/pages/study-session.page.tsx` — use StudySessionHeader, full-width layout
- `client/src/modules/learning/components/study-session-header.tsx` — NEW shared header
- Restyle existing: `quiz-view.tsx`, `flashcard-view.tsx`
- New mode components as needed for match, typing, speaking, listening, speed

**Shared layout:**
- No sidebar during study sessions
- StudySessionHeader at top
- Centered content: `max-w-4xl mx-auto`
- Warm white background with subtle watermark

**Mode-specific:**
- **Quiz**: category badge → large Lexend word → definition → 2x2 option cards → "Confirm Answer" pill, "Skip this question" link
- **Match**: two-column (Academic Terms ↔ Semantic Meanings), dashed connection lines, match progress bar, bottom tab bar (Learn/Review/Stats/Settings)
- **Typing**: definition in quotes → large input with underline → "Enter to Check" navy pill + "Show First Letter" hint, topic tags at bottom
- **Speaking**: word + IPA pronunciation → large microphone circle → "Listening..." indicator → pronunciation feedback, score badge
- **Listening**: audio playback → word options → speed controls
- **Speed**: countdown emphasis → rapid-fire cards → streak counter

### Step 5: Dictionary Search

**Files:**
- `client/src/modules/learning/pages/dictionary-search.page.tsx`
- `client/src/modules/learning/components/search-input.tsx`
- `client/src/modules/learning/components/search-results-list.tsx`
- `client/src/modules/learning/components/word-sense-card.tsx`

- Hero: "Easy English Dictionary" Lexend heading + descriptive subtitle
- Search: large rounded-full input with search icon, full-width
- Recent Searches: horizontal pill chips with "Clear History" link
- Word cards: 3-column grid, each with color-coded POS badge (adjective=teal, noun=blue, verb=amber), word in Lexend bold, pronunciation, short definition, "Add to Learning" / "Learned" button
- Bottom CTA: "Master 10 New Words Today" banner with dual buttons

### Step 6: Word Detail

**Files:**
- `client/src/modules/learning/pages/word-sense-detail.page.tsx`
- `client/src/modules/learning/components/word-sense-detail.tsx`

- Back navigation with arrow
- Part-of-speech badge (color-coded pill) + word in huge Lexend + pronunciation with audio button
- Two-column layout:
  - Left: Definition block, Examples with amber bullet dots, Synonyms (teal pills), Antonyms (coral pills), Phrases & Idioms cards
  - Right sidebar: Mastery Level percentage, "Ready to Learn?" card with Study Now CTA + Add to List link, Origin info
- Bottom: "Expand Your Vocabulary" section with related word cards

### Step 7: Topics

**Files:**
- `client/src/modules/topic/pages/topics.page.tsx`
- `client/src/modules/topic/components/topic-card.tsx`

- Hero: "Explore Your Linguistic Realms" italic Lexend heading
- Category tabs: pill tabs (All Topics, Professional, Leisure, Foundation)
- Daily Goal sidebar: right-aligned card with progress info
- Topic cards: icon, title, description, word count, progress bar with %, status badge, "Create New Topic" pill button
- Pagination: numbered dots

### Step 8: Workspace Switcher

**Files:**
- `client/src/modules/workspace/components/workspace-switcher.tsx`
- Possibly new: `client/src/modules/workspace/pages/workspace-list.page.tsx`

- Top tabs: Workspaces, Library, Achievements, Settings
- Hero: "Your Learning Sanctuary" heading + "New Workspace" navy pill button
- Workspace cards: name, active badge, word count, mastered count, progress %
- "Create New Space" card with + icon
- Stats grid: Study Streak, Scholar level, New Insights, Review Ready
- Motivational banner: library image + "Focus is the key to deep mastery" quote

### Step 9: Workspace Settings

**File:** New `client/src/modules/workspace/pages/workspace-settings.page.tsx`

- Settings-specific sidebar nav (Workspaces, Library, Achievements, Settings)
- Tabs: Overview, Workspace Settings, Integrations
- Core Identity card: workspace name, daily target (words/day), study reminder time
- Current milestone badge with image
- Learning Methodology: Spaced Repetition + Immersion Sprint description cards
- Velocity stats: Target Velocity, Daily Streak
- Danger Zone: Archive Workspace (destructive action)

### Step 10: Workspace Setup Wizard (4 steps)

**Files:**
- `client/src/modules/workspace/pages/new-workspace.page.tsx`
- `client/src/modules/workspace/components/new-wizard/workspace-basics-step.tsx`
- `client/src/modules/workspace/components/new-wizard/workspace-learning-step.tsx`
- `client/src/modules/workspace/components/new-wizard/workspace-preferences-step.tsx`
- `client/src/modules/workspace/components/new-wizard/workspace-review-step.tsx`
- `client/src/modules/workspace/components/new-wizard/workspace-wizard.tsx`

- Left sidebar stepper: vertical step list with active blue bar indicator
- Progress bar: amber/gold with step counter ("STEP X OF 4")
- Step 1: "Begin your scholarly journey" heading + name/description form + 3 feature cards at bottom
- Step 2: Language focus picker with test link
- Step 3: Learning pace preferences
- Step 4: Review — identity card, target language, goals, learning mode + "Create Workspace" navy pill + motivational banner
- Navigation: Back (outline pill) + Continue (filled navy pill)

## Recurring Design Patterns

### Buttons
- **Primary CTA**: `bg-gradient-to-br from-primary to-primary-container text-white rounded-full px-10 py-5 font-headline font-bold shadow-lg`
- **Secondary**: outline with `border-outline-variant rounded-full`
- **Ghost**: `rounded-full hover:bg-surface-container-high`

### Cards
- `rounded-2xl border border-outline-variant/20 shadow-sm p-6` (standard)
- `rounded-3xl` for featured/hero cards
- Glass effect cards: `bg-white/70 backdrop-blur-md`

### Badges/Tags
- Pill-shaped: `rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide`
- Color-coded: teal (learning/success), amber (progress/streak), coral (danger/antonyms), navy (primary)

### Progress Indicators
- Bar: `h-2.5 bg-surface-container-highest rounded-full` track + `bg-tertiary-fixed-dim rounded-full shadow-[0_0_8px_rgba(255,185,84,0.4)]` fill
- Streak counter: fire emoji + count in orange pill

### Typography Hierarchy
- Page title: `font-headline text-5xl font-extrabold tracking-tight text-on-primary-fixed`
- Section heading: `font-headline text-2xl font-bold`
- Card title: `font-headline text-lg font-semibold`
- Body: `font-body text-base text-on-surface`
- Label: `font-label text-xs font-medium uppercase tracking-wider text-on-surface-variant`

## Constraints

- **No logic changes** — this is purely visual restyling
- **No new data fetching** — use existing hooks and stores
- **Preserve Shadcn structure** — restyle via CSS variables and className updates, don't replace Shadcn primitives
- **Update ds-* wrappers** in `shared/ui/base/` to reflect new design tokens rather than creating parallel component sets
- **Dark theme** — update `.dark` variables in globals.css to maintain dark mode support with the new palette

## Verification

For each step:
1. Run `npm run dev` in client/ and verify the page visually matches the corresponding HTML mockup screenshot in `tmp/`
2. Run `npm run lint` to ensure no code quality issues
3. Test light and dark mode
4. Test sidebar collapsed/expanded state
5. Verify no visual regressions on previously completed pages
