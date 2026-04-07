# Easy English — Google Stitch Design Spec

**Product:** Easy English V2  
**Type:** Language Learning SaaS (Multi-tenant)  
**Date:** 2026-04-07  
**Stack:** React 19, TanStack Router, Shadcn UI, Tailwind CSS 4, NestJS, CQRS/DDD

---

## 1. Product Overview

Easy English is a multi-tenant SaaS platform for learning English vocabulary using spaced repetition (FSRS algorithm). Users belong to one or more **workspaces** (Personal / Team / Classroom), study vocabulary via **flashcards** or **quiz mode**, organize words into **topics**, and track progress over time.

**Core value loop:**
> Look up a word in the dictionary → Add it to your learning list (optionally to a topic) → Study it via spaced repetition → Track mastery

---

## 2. User Journey

```
Visitor
  └─ Landing Page (/)
       ├─ Register (/register)
       └─ Login (/login)
             └─ Workspace check
                  ├─ No workspace → Workspace Wizard (/workspace/new)  [4 steps]
                  └─ Has workspace → Dashboard (/dashboard)
                        ├─ My Learning (/learning)
                        │    ├─ Start Review Session (/learning/study?mode=due)
                        │    ├─ Study by Topic (/learning/study?mode=topic&topicId=...)
                        │    └─ Study Session Complete → Session Summary
                        ├─ Topics (/learning/topics)
                        │    └─ Topic Detail (/learning/topics/:topicId)
                        │         └─ Add Words → Dictionary (/dictionary)
                        ├─ Dictionary (/dictionary)
                        │    └─ Word Sense Detail (/dictionary/senses/:senseId)
                        ├─ Flashcards (/flashcards)
                        │    ├─ Create / Delete cards
                        │    └─ Stats (/flashcards/stats)
                        ├─ Progress (/progress)  [planned]
                        ├─ Achievements (/achievements)  [planned]
                        └─ Settings (/settings)  [planned]
```

---

## 3. Feature Map

| Feature | Status | Route |
|---|---|---|
| Authentication (email + social) | Live | `/login`, `/register` |
| Workspace Wizard (4-step onboarding) | Live | `/workspace/new` |
| Workspace Switcher | Live | sidebar header |
| Dashboard (stats + recent topics) | Live | `/dashboard` |
| My Learning (due cards + vocabulary list) | Live | `/learning` |
| Study Session — Flashcard mode | Live | `/learning/study` |
| Study Session — Quiz mode | Live | `/learning/study?mode=quiz` |
| Session Summary (accuracy, time, FSRS ratings) | Live | auto after session |
| Topics CRUD | Live | `/learning/topics` |
| Topic Detail + Word List | Live | `/learning/topics/:topicId` |
| Dictionary Search | Live | `/dictionary` |
| Word Sense Detail + Add to Learning | Live | `/dictionary/senses/:senseId` |
| Flashcard CRUD (custom + dictionary) | Live | `/flashcards` |
| Flashcard Stats | Live | `/flashcards/stats` |
| Progress Dashboard | Planned | `/progress` |
| Achievements | Planned | `/achievements` |
| Settings | Planned | `/settings` |
| Review Hub | Planned | `/review` |

---

## 4. Page Map

### Public (Unauthenticated)

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Hero with login/register links |
| Login | `/login` | Email + social auth, centered card |
| Register | `/register` | Sign-up form, centered card |

### Onboarding

| Page | Route | Description |
|---|---|---|
| Workspace Wizard | `/workspace/new` | 4-step wizard: Basics → Learning → Preferences → Review |

### App (Authenticated)

| Page | Route | Layout |
|---|---|---|
| Dashboard | `/dashboard` | App Shell |
| My Learning | `/learning` | App Shell |
| Study Session | `/learning/study` | Fullscreen focus |
| Topics List | `/learning/topics` | App Shell |
| Topic Detail | `/learning/topics/:topicId` | App Shell |
| Dictionary | `/dictionary` | App Shell |
| Word Sense Detail | `/dictionary/senses/:senseId` | App Shell |
| Flashcards | `/flashcards` | App Shell |
| Flashcard Stats | `/flashcards/stats` | App Shell |
| Progress | `/progress` | App Shell (planned) |
| Achievements | `/achievements` | App Shell (planned) |
| Settings | `/settings` | App Shell (planned) |

---

## 5. Navigation Structure

### Sidebar (Collapsible, icon mode supported)

```
┌─────────────────────────────┐
│  [WorkspaceSwitcher]        │  ← Workspace name + switcher dropdown
├─────────────────────────────┤
│  PRIORITY                   │
│  🔥 Today's Review    [3]   │  ← Badge = due count, highlighted bg
├─────────────────────────────┤
│  LEARNING                   │
│  📖 My Learning             │
│  📁 Topics                  │
│  🃏 Flashcards              │
│  ➕ Add Word                │
├─────────────────────────────┤
│  PROGRESS                   │
│  📈 Progress                │
│  🏆 Achievements            │
├─────────────────────────────┤
│  SYSTEM                     │
│  ⚙️ Settings               │
├─────────────────────────────┤
│  [NavUser — avatar + email] │  ← Footer: logout, profile
└─────────────────────────────┘
```

### Top / App Header

- Left: Sidebar toggle + breadcrumb / page title
- Right: Search menu (global), notification dropdown, mode switcher (dark/light), language switcher

### Mobile Navigation

- Sidebar collapses to icon-only rail
- Bottom tab bar pattern (planned): Review · Learn · Topics · More

---

## 6. Layout Patterns

### 6.1 App Shell Layout
Used by all authenticated pages.
- Left: Collapsible sidebar (240px expanded / 48px icon)
- Right: Main content area with header
- Max content width: `max-w-7xl` (dashboard) or `max-w-3xl`/`max-w-4xl` (list pages)

### 6.2 Unauthenticated Layout
Used by login/register.
- Centered card on full-height background
- `FormWrapper` component: logo top, title, subtitle, footer link
- Width: `max-w-md`

### 6.3 Wizard Layout
Used by Workspace onboarding.
- Centered card with progress bar at top showing steps
- Animated step transitions (Motion)
- Steps: Basics → Learning → Preferences → Review
- Navigation: Back / Next / Skip / Submit

### 6.4 Study Session Layout
Used by `/learning/study`.
- Full viewport height, centered card
- Minimal UI: Exit button (top-left), progress bar (top-center), keyboard hint (top-right)
- Flashcard occupies center
- Rating buttons (`Again / Hard / Good / Easy`) at bottom
- No sidebar visible during active study

### 6.5 List + Detail Layout
Used by Topics, Dictionary.
- List page: header with count + action button, separator, optional column headers, paginated list
- Detail page: breadcrumb back-link, entity header with actions, section with paginated items

---

## 7. Design System Requirements

### 7.1 Typography

| Role | Usage |
|---|---|
| Display (3xl–4xl, extrabold) | Page heroes, session complete heading |
| Title (xl, semibold) | Page headers (H1) |
| Section (sm, uppercase, tracking-wider) | Column headers, section labels |
| Body (sm, regular) | List item text, descriptions |
| Caption (xs, muted) | Timestamps, secondary metadata |
| Mono / Keyboard | Shortcut keys (`<kbd>`) |

### 7.2 Spacing

- Page padding: `px-6 py-10`
- Section gap: `gap-6`
- Card internal: `p-4`–`p-8`
- Separator rhythm: `<Separator />` between sections

### 7.3 Color Roles

| Token | Usage |
|---|---|
| `primary` | CTAs, active states, progress fills |
| `primary/10` | Soft highlight backgrounds |
| `muted-foreground` | Secondary text, labels |
| `muted/50` | Row hover backgrounds |
| `destructive` | Delete actions, "Again" rating |
| `orange-500` | Streak indicator |
| `blue-500` | Words learned stat |
| `green-500` | Accuracy, mastered, "Good" rating |
| `yellow-500` | Stars, achievements |
| `purple-500` | Study time stat |
| `border` | Card and row separators |
| `card` | Card surface |
| `background` | Page background |

### 7.4 Border Radius

- Cards: `rounded-2xl`
- Buttons: `rounded-md` (default)
- Pills / tags: `rounded-full`
- Small chips: `rounded-lg`

### 7.5 Motion / Animation

- Page entry: `animate-in fade-in slide-in-from-bottom-4`
- Flashcard flip: `rotateY` 3D transition (400ms, easeInOut)
- List item add/remove: `AnimatePresence` with height + opacity
- Stat cards: staggered `opacity + y` on mount
- Wizard steps: animated slide transition

---

## 8. Component Inventory

### 8.1 App Shell

| Component | Description |
|---|---|
| `AppSidebar` | Collapsible sidebar with nav groups, workspace switcher, user footer |
| `WorkspaceSwitcher` | Dropdown to switch between workspaces |
| `NavGroup` | Labeled group of sidebar menu items with optional badge |
| `NavUser` | User avatar + email + logout dropdown in sidebar footer |
| `AppHeader` | Top bar with sidebar toggle, search, notifications, mode + language switchers |
| `SearchMenu` | Global search overlay / command palette |
| `NotificationDropdown` | Notification bell with dropdown |
| `ModeSwitcher` | Dark / light / system toggle |
| `LanguageSwitcher` | i18n language selector |

### 8.2 Auth Components

| Component | Description |
|---|---|
| `LoginForm` | Email + password form with submit |
| `RegisterForm` | Sign-up form |
| `SocialAuthButtons` | OAuth provider buttons (Google etc.) |
| `PasswordInput` | Input with show/hide toggle |
| `FormWrapper` | Centered card layout for auth pages |

### 8.3 Workspace / Onboarding

| Component | Description |
|---|---|
| `WorkspaceWizard` | Root wizard orchestrator (4 steps) |
| `WizardProgressBar` | Step indicator with labels |
| `WorkspaceBasicsStep` | Name + type (Personal/Team/Classroom) + description |
| `WorkspaceLearningStep` | Native language + learning language picker |
| `WorkspacePreferencesStep` | Daily goal, session length, notifications (skippable) |
| `WorkspaceReviewStep` | Summary + submit |
| `LanguagePicker` | Search + select language combobox |
| `WizardLayout` | Centered container with step progress |
| `WizardStepShell` | Step wrapper with title + description + form |
| `AnimatedStep` | Framer Motion wrapper for step transitions |

### 8.4 Dashboard

| Component | Description |
|---|---|
| `WelcomeBanner` | Gradient hero card with CTA buttons |
| `StatCard` | Metric card: icon + value + trend (streak, words, accuracy) |
| `DailyGoalProgress` | Circular SVG progress ring with % complete |
| `RecentTopicsList` | Last-studied topics with progress bar + timestamp |

### 8.5 Study / Flashcard

| Component | Description |
|---|---|
| `FlashcardView` | Flip card: front (word) / back (definition + example) |
| `RatingButtons` | 4 FSRS buttons: Again(1) · Hard(2) · Good(3) · Easy(4) with keyboard shortcuts |
| `StudyProgress` | `current / total` progress indicator |
| `SessionCompleteCard` | Post-session summary: reviewed count, accuracy %, time, rating breakdown |
| `QuizView` | Multiple-choice quiz interface |
| `FeedbackOverlay` | Animated overlay showing next review date after rating |

### 8.6 Learning / Topics

| Component | Description |
|---|---|
| `LearningList` | Paginated vocabulary list with word + progress state |
| `TopicCard` | Row item: name + word count + last updated + edit/delete actions |
| `TopicWordCard` | Row item inside topic: word + definition + remove action |
| `CreateTopicDialog` | Modal form: name + description |
| `UpdateTopicDialog` | Edit modal pre-filled with topic data |
| `AddToLearningButton` | Button to enroll a word sense into user's learning list |
| `TopicPill` | Chip button for topic-based study navigation |

### 8.7 Dictionary

| Component | Description |
|---|---|
| `SearchInput` | Debounced full-text search input |
| `SearchResultsList` | Paginated word sense cards |
| `WordSenseCard` | Card: word + POS + short definition + Add button |
| `WordSenseDetail` | Full page: word, all senses, examples, add to learning/topic |
| `WordSenseSheet` | Slide-out panel for quick-view of a word sense |

### 8.8 Base Design System (DS)

| Component | Variants |
|---|---|
| `DsButton` | default, secondary, outline, ghost, destructive; sizes: sm, default, lg, icon |
| `DsCard` | with `.Header`, `.Content`, `.Footer` sub-components |
| `DsBadge` | default, secondary, outline, destructive |
| `DsInput` | with leadingIcon, trailingIcon, error state |
| `DsTextarea` | auto-resize, error state |
| `DsSelect` + `DsSelectItem` | dropdown select |
| `DsSpinner` | sizes: sm, default, lg |
| `DsProgress` | sizes: sm, default, lg; value 0–100 |
| `DsStatCard` | icon + value + unit + description |
| `DsEmptyState` | icon + title + subtitle + optional CTA |
| `DsAlertDialog` | Confirm/cancel destructive actions |

### 8.9 Pattern Wrappers

| Component | Description |
|---|---|
| `FormWrapper` | Auth page centered card (variant: `centered`) |
| `PageLayout` | Standard page with optional header + content |
| `ModalWrapper` | Dialog wrapper with consistent sizing |
| `WizardLayout` | Full-screen wizard container with step progress |
| `WizardStepShell` | Step-level wrapper with title/description |

---

## 9. UI States

Every data-driven component handles these states:

### Loading
- Skeleton lines for list pages (`<Skeleton />`)
- `DsSpinner` centered for full-page or section loads
- Inline spinner + "Loading…" text for small sections

### Empty
- `DsEmptyState`: rounded icon container + heading + subtitle + CTA button
- Examples:
  - Flashcards: "No flashcards yet" + Create First Card button
  - Topics: "No topics yet" + Create your first topic button
  - Topic words: "No words yet" + Browse Dictionary button
  - Study session: "All caught up!" + Back to My Learning button

### Error
- Inline destructive text block (small, bordered) for section errors
- `"Failed to load topics"` + retry hint pattern

### Success / Confirmation
- `SessionCompleteCard`: full-screen celebration with green check + stats
- Sonner toast for CRUD operations (create, delete)

### Submitting
- `DsButton` with `isLoading` prop shows inline spinner + `loadingLabel`
- Form inputs disabled during submit

---

## 10. UX Rules

### Navigation & Flow
1. **Sidebar-first navigation** — all primary destinations reachable from sidebar in ≤1 click
2. **Today's Review always visible** as a priority item with a badge showing due count
3. **Workspace context is always active** — no page renders without a selected workspace
4. **Study session is distraction-free** — sidebar/header hidden, only progress + exit visible

### Cards & Lists
5. **Row-based lists** for topics, flashcards, vocabulary (compact, scannable)
6. **Card-based grids** for dashboard stats, wizard type selection
7. **Hover states on rows** — subtle `bg-muted/50` highlight, reveal action buttons
8. **Progressive disclosure** — edit/delete actions are `opacity-0 group-hover:opacity-100`

### Study & Spaced Repetition
9. **Always show keyboard shortcuts** on rating buttons (`1` `2` `3` `4`)
10. **Space bar flips the card** — displayed as hint in session header
11. **Feedback overlay** after rating shows next review date (800ms, then auto-advance)
12. **Study type toggle** (Flashcard / Quiz) lives next to the Review button on My Learning

### Forms & Modals
13. **All destructive actions** require `DsAlertDialog` confirmation
14. **Wizards use skip** for optional steps (preferences)
15. **Forms submit on Enter** where natural; validate inline on blur

### Responsive
16. **Sidebar collapses to icon-only** on narrow viewports (`collapsible="icon"`)
17. **Rating buttons stack vertically** on mobile, horizontal on `sm+`
18. **Dashboard grid** collapses from 3-col → 1-col on small screens

### Feedback & Motion
19. **Staggered entry animations** on stat cards (0.1s delay per card)
20. **AnimatePresence** for list add/remove to prevent layout pop
21. **Page-level entry**: `fade-in slide-in-from-bottom-4 duration-500`

---

## 11. Route Map (Complete)

```
/                           Landing
/login                      Login (unauthenticated layout)
/register                   Register (unauthenticated layout)
/workspace/new              Workspace Wizard (authenticated, wizard layout)
/dashboard                  Dashboard (app shell)
/learning                   My Learning (app shell)
/learning/study             Study Session (fullscreen layout)
/learning/topics            Topics List (app shell)
/learning/topics/:topicId   Topic Detail (app shell)
/dictionary                 Dictionary Search (app shell)
/dictionary/senses/:senseId Word Sense Detail (app shell)
/flashcards                 Flashcard List (app shell)
/flashcards/study           Flashcard Study (fullscreen)
/flashcards/stats           Stats Dashboard (app shell)
/progress                   Progress (planned)
/achievements               Achievements (planned)
/settings                   Settings (planned)
/review                     Review Hub (planned)
```

---

## 12. Workspace Types

| Type | Icon | Use case |
|---|---|---|
| Personal | User | Solo learner |
| Team | Briefcase | Study group, colleagues |
| Classroom | GraduationCap | Teacher + students |

Multi-tenancy: each user can belong to multiple workspaces, switch via `WorkspaceSwitcher` in sidebar header.

---

## 13. FSRS Rating System

Used in all study sessions:

| Rating | Value | Button Variant | Keyboard |
|---|---|---|---|
| Again | 1 | destructive (red) | `1` |
| Hard | 2 | secondary | `2` |
| Good | 3 | default (primary) | `3` |
| Easy | 4 | outline | `4` |

After rating, the server returns `nextDueDate` and `intervalDays` shown in feedback overlay.

---

*Generated from codebase analysis for Google Stitch AI UI generation.*
