# HTML → React UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visually restyle all React pages to match the 18 HTML mockups in `tmp/`, updating the design system tokens and layout shell along the way. No logic changes.

**Architecture:** Update CSS variables in `globals.css` and design token TypeScript files as the foundation. Restyle existing Shadcn-based components by updating classNames and CSS variable values. Add new `StudySessionHeader` component. Apply MD3 scholarly theme (deep navy + teal + amber) across all pages.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Shadcn UI, CVA (class-variance-authority), Material Symbols icons, Lexend + Be Vietnam Pro fonts.

---

## Phase 1: Design System Foundation

### Task 1: Update globals.css — CSS Variables & Tailwind Theme

**Files:**
- Modify: `client/src/styles/globals.css`

This is the most critical file — all other changes depend on it. Replace the entire `:root` block with the new MD3 scholarly palette, add font imports, and update `@theme inline`.

- [ ] **Step 1: Read the current globals.css**

Read `client/src/styles/globals.css` in full to see the current `:root`, `.dark`, and `@theme inline` sections before editing.

- [ ] **Step 2: Replace `:root` block**

In `client/src/styles/globals.css`, find the `:root {` block (around line 8) and replace everything up to (but not including) `/* ===== Dark Theme ===== */` with:

```css
:root {
  /* Brand Colors */
  --primary: #002046;
  --primary-foreground: #ffffff;
  --primary-container: #1b365d;
  --on-primary-container: #87a0cd;

  /* Secondary / Teal (Learning/Success) */
  --secondary: #006b5e;
  --secondary-foreground: #ffffff;
  --secondary-container: #94f0df;
  --on-secondary-container: #006f62;
  --secondary-fixed: #97f3e2;
  --on-secondary-fixed: #00201b;
  --secondary-fixed-dim: #7ad7c6;
  --on-secondary-fixed-variant: #005047;

  /* Tertiary / Amber (Progress/Streaks) */
  --tertiary: #311d00;
  --tertiary-foreground: #ffffff;
  --tertiary-container: #4d3000;
  --tertiary-fixed: #ffddb4;
  --tertiary-fixed-dim: #ffb954;
  --on-tertiary-fixed: #291800;
  --on-tertiary-fixed-variant: #633f00;
  --on-tertiary-container: #d4922a;

  /* Surfaces (MD3 elevation system) */
  --surface: #faf9fd;
  --surface-bright: #faf9fd;
  --surface-dim: #dad9dd;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f4f3f7;
  --surface-container: #efedf1;
  --surface-container-high: #e9e7eb;
  --surface-container-highest: #e3e2e6;

  /* Background (alias for surface in this theme) */
  --background: #faf9fd;
  --foreground: #1a1b1e;

  /* Semantic mappings */
  --card: #ffffff;
  --card-foreground: #1a1b1e;
  --popover: #ffffff;
  --popover-foreground: #1a1b1e;
  --muted: #f4f3f7;
  --muted-foreground: #44474e;
  --accent: #f4f3f7;
  --accent-foreground: #1a1b1e;
  --destructive: #ba1a1a;
  --destructive-foreground: #ffffff;

  /* Borders */
  --border: #c4c6cf;
  --input: #c4c6cf;
  --ring: #465f88;
  --outline: #74777f;
  --outline-variant: #c4c6cf;

  /* Inverse colors */
  --inverse-surface: #2f3033;
  --inverse-on-surface: #f1f0f4;
  --inverse-primary: #aec7f7;

  /* Error */
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --on-error: #ffffff;
  --on-error-container: #93000a;

  /* Sidebar (separate from main surface for app chrome) */
  --sidebar: #f4f3f7;
  --sidebar-foreground: #1a1b1e;
  --sidebar-primary: #002046;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #e3e2e6;
  --sidebar-accent-foreground: #1a1b1e;
  --sidebar-border: #c4c6cf;
  --sidebar-ring: #465f88;

  /* Charts */
  --chart-1: #465f88;
  --chart-2: #006b5e;
  --chart-3: #94f0df;
  --chart-4: #ffb954;
  --chart-5: #87a0cd;

  /* Border Radius */
  --radius: 1rem;
}
```

- [ ] **Step 3: Replace `.dark` block**

Find `.dark {` (around line 45) and replace up to (but not including) `/* ===== Tailwind Theme ===== */` with:

```css
.dark {
  --primary: #aec7f7;
  --primary-foreground: #001b3d;
  --primary-container: #1b365d;
  --on-primary-container: #d6e3ff;

  --secondary: #4fdfc7;
  --secondary-foreground: #00201b;
  --secondary-container: #005047;
  --on-secondary-container: #97f3e2;
  --secondary-fixed: #97f3e2;
  --on-secondary-fixed: #00201b;
  --secondary-fixed-dim: #4fdfc7;
  --on-secondary-fixed-variant: #4fdfc7;

  --tertiary: #ffb954;
  --tertiary-foreground: #291800;
  --tertiary-container: #633f00;
  --tertiary-fixed: #ffddb4;
  --tertiary-fixed-dim: #ffb954;
  --on-tertiary-fixed: #291800;
  --on-tertiary-fixed-variant: #ffb954;
  --on-tertiary-container: #ffddb4;

  --surface: #1a1b1e;
  --surface-bright: #2f3033;
  --surface-dim: #141416;
  --surface-container-lowest: #0f1011;
  --surface-container-low: #1a1b1e;
  --surface-container: #2f3033;
  --surface-container-high: #3a3a3e;
  --surface-container-highest: #45454a;

  --background: #1a1b1e;
  --foreground: #f4f3f7;

  --card: #2f3033;
  --card-foreground: #f4f3f7;
  --popover: #2f3033;
  --popover-foreground: #f4f3f7;
  --muted: #2f3033;
  --muted-foreground: #9a9a9e;
  --accent: #2f3033;
  --accent-foreground: #f4f3f7;
  --destructive: #ffb4ab;
  --destructive-foreground: #690005;

  --border: #44474e;
  --input: #44474e;
  --ring: #aec7f7;
  --outline: #74777f;
  --outline-variant: #44474e;

  --inverse-surface: #f4f3f7;
  --inverse-on-surface: #2f3033;
  --inverse-primary: #465f88;

  --error: #ffb4ab;
  --error-container: #93000a;
  --on-error: #690005;
  --on-error-container: #ffdad6;

  --sidebar: #1a1b1e;
  --sidebar-foreground: #f4f3f7;
  --sidebar-primary: #aec7f7;
  --sidebar-primary-foreground: #001b3d;
  --sidebar-accent: #2f3033;
  --sidebar-accent-foreground: #f4f3f7;
  --sidebar-border: #44474e;
  --sidebar-ring: #aec7f7;

  --chart-1: #aec7f7;
  --chart-2: #4fdfc7;
  --chart-3: #ffb954;
  --chart-4: #87a0cd;
  --chart-5: #94f3df;
}
```

- [ ] **Step 4: Update `@theme inline` block**

Replace the entire `@theme inline {` block (starting at line 81) with:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-container: var(--primary-container);
  --color-on-primary-container: var(--on-primary-container);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary-container: var(--secondary-container);
  --color-on-secondary-container: var(--on-secondary-container);
  --color-secondary-fixed: var(--secondary-fixed);
  --color-on-secondary-fixed: var(--on-secondary-fixed);
  --color-secondary-fixed-dim: var(--secondary-fixed-dim);
  --color-on-secondary-fixed-variant: var(--on-secondary-fixed-variant);
  --color-tertiary: var(--tertiary);
  --color-tertiary-foreground: var(--tertiary-foreground);
  --color-tertiary-container: var(--tertiary-container);
  --color-tertiary-fixed: var(--tertiary-fixed);
  --color-tertiary-fixed-dim: var(--tertiary-fixed-dim);
  --color-on-tertiary-fixed: var(--on-tertiary-fixed);
  --color-on-tertiary-fixed-variant: var(--on-tertiary-fixed-variant);
  --color-on-tertiary-container: var(--on-tertiary-container);
  --color-surface: var(--surface);
  --color-surface-bright: var(--surface-bright);
  --color-surface-dim: var(--surface-dim);
  --color-surface-container-lowest: var(--surface-container-lowest);
  --color-surface-container-low: var(--surface-container-low);
  --color-surface-container: var(--surface-container);
  --color-surface-container-high: var(--surface-container-high);
  --color-surface-container-highest: var(--surface-container-highest);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-error: var(--error);
  --color-error-container: var(--error-container);
  --color-on-error: var(--on-error);
  --color-on-error-container: var(--on-error-container);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-outline: var(--outline);
  --color-outline-variant: var(--outline-variant);
  --color-inverse-surface: var(--inverse-surface);
  --color-inverse-on-surface: var(--inverse-on-surface);
  --color-inverse-primary: var(--inverse-primary);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --radius-sm: calc(var(--radius) * 0.5);
  --radius-md: calc(var(--radius) * 0.75);
  --radius-lg: calc(var(--radius) * 1.5);
  --radius-xl: calc(var(--radius) * 2.5);
  --radius-2xl: calc(var(--radius) * 3);
  --radius-3xl: calc(var(--radius) * 4);
  --radius-4xl: calc(var(--radius) * 5);
  --radius-full: 9999px;
}
```

- [ ] **Step 5: Add font imports**

Add to the top of `globals.css`, before the `@import` statements:

```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap');
```

Then add after `@theme inline` closes (before `@layer base`):

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-[family-name:var(--font-sans)];
  }
  html {
    @apply font-[family-name:var(--font-sans)];
  }
}

/* Font utility classes */
.font-headline {
  font-family: var(--font-headline), 'Lexend', sans-serif;
}

/* Override Tailwind's default font-sans */
@layer base {
  :root {
    --font-sans: 'Be Vietnam Pro', sans-serif;
    --font-headline: 'Lexend', sans-serif;
  }
}
```

- [ ] **Step 6: Verify**

Run `cd client && npm run dev` and check that the global CSS loads. Navigate to any page — the background should be warm white (#faf9fd) and primary color should be deep navy. Open DevTools and verify CSS variables are applied on `:root`.

---

### Task 2: Update TypeScript Design Tokens

**Files:**
- Modify: `client/src/shared/ui/design-tokens/colors.ts`
- Modify: `client/src/shared/ui/design-tokens/typography.ts`
- Modify: `client/src/shared/ui/design-tokens/radius.ts`

- [ ] **Step 1: Update colors.ts**

Read `client/src/shared/ui/design-tokens/colors.ts`. Add the new semantic color groups by extending the existing `color` object. Find the closing `} as const;` of the `color` export and add new groups before it:

Add after the `ring` group (before `} as const;`):

```ts
/** Tertiary / Amber — progress, streaks, highlights */
tertiary: {
  default: 'var(--tertiary)',
  foreground: 'var(--tertiary-foreground)',
  container: 'var(--tertiary-container)',
  fixed: 'var(--tertiary-fixed)',
  'fixed-dim': 'var(--tertiary-fixed-dim)',
  muted: 'var(--tertiary) / 10%',
},
/** Surface hierarchy (MD3) */
surface: {
  default: 'var(--surface)',
  bright: 'var(--surface-bright)',
  dim: 'var(--surface-dim)',
  'container-lowest': 'var(--surface-container-lowest)',
  'container-low': 'var(--surface-container-low)',
  container: 'var(--surface-container)',
  'container-high': 'var(--surface-container-high)',
  'container-highest': 'var(--surface-container-highest)',
},
/** On-surface text variants */
onSurface: {
  default: 'var(--on-surface)',
  variant: 'var(--on-surface-variant)',
},
/** Border / outline */
outline: {
  default: 'var(--outline)',
  variant: 'var(--outline-variant)',
},
/** Inverse colors (for dark-on-light) */
inverse: {
  surface: 'var(--inverse-surface)',
  'on-surface': 'var(--inverse-on-surface)',
  primary: 'var(--inverse-primary)',
},
/** Error */
error: {
  default: 'var(--error)',
  container: 'var(--error-container)',
  foreground: 'var(--on-error)',
  'on-container': 'var(--on-error-container)',
},
```

- [ ] **Step 2: Update typography.ts**

Read `client/src/shared/ui/design-tokens/typography.ts`. Find the `fontFamily` section and update it:

```ts
fontFamily: {
  sans: 'var(--font-sans)',      // Be Vietnam Pro
  mono: 'var(--font-mono)',
  display: 'var(--font-headline)', // Lexend
  headline: 'var(--font-headline)', // Lexend — alias for .font-headline
},
```

- [ ] **Step 3: Update radius.ts**

Read `client/src/shared/ui/design-tokens/radius.ts`. The radius values need to match the new `--radius: 1rem` in CSS. Update the radius values:

```ts
export const radius = {
  none: '0',
  sm: '0.5rem',    // 8px — --radius-sm
  md: '0.75rem',   // 12px — --radius-md
  DEFAULT: '1rem', // 16px — --radius (was 0.625rem)
  lg: '1.5rem',    // 24px — --radius-lg
  xl: '2.5rem',    // 40px — --radius-xl
  '2xl': '3rem',   // 48px — --radius-2xl
  '3xl': '4rem',    // 64px — --radius-3xl
  '4xl': '5rem',    // 80px — --radius-4xl
  full: '9999px',  // pills
} as const;
```

- [ ] **Step 4: Commit**

```bash
git add client/src/styles/globals.css client/src/shared/ui/design-tokens/
git commit -m "feat(ui): apply MD3 scholarly design tokens — navy/teal/amber palette, Lexend + Be Vietnam Pro fonts"
```

---

## Phase 2: Layout Shell

### Task 3: Restyle AppSidebar

**Files:**
- Modify: `client/src/modules/shell/components/app-sidebar.tsx`
- Modify: `client/src/modules/shell/ui/nav-group.tsx`

- [ ] **Step 1: Read current files**

Read `app-sidebar.tsx` and `nav-group.tsx` to understand the current structure.

- [ ] **Step 2: Restyle app-sidebar.tsx**

In `AppSidebar`, find the `<Sidebar collapsible="icon" {...props}>` component. Update its className:

```tsx
<Sidebar
  collapsible="icon"
  className="rounded-r-3xl shadow-xl"
  {...props}
>
```

Remove the `bg-primary/5 rounded-lg mx-2 mt-2 pb-2` wrapper around `navPriority` in the nav group. Remove the grouped section titles (`t('sidebar.priority')`, `t('sidebar.learning')`, etc.) and just render all nav items as a flat list with `space-y-1` between them.

Update the `<Separator />` before footer to include a top border class:

```tsx
<Separator className="border-t border-outline-variant/20" />
```

- [ ] **Step 3: Restyle nav-group.tsx**

Read `client/src/modules/shell/ui/nav-group.tsx`. The key changes:

1. Remove `title` prop rendering (group headers) — just render items directly.
2. Update the nav item rendering to use pill shape:

```tsx
// In NavGroup where items are rendered:
<NavLink
  key={item.id}
  to={item.url}
  className={({ isActive }) =>
    cn(
      'flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-gradient-to-br from-primary to-primary-container text-white shadow-lg scale-[1.02]'
        : 'text-on-surface-variant hover:bg-surface-container-high'
    )
  }
>
  {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
  <span className="font-headline">{item.title}</span>
  {item.badge != null && (
    <Badge className="ml-auto bg-surface-container-high text-on-surface-variant rounded-full px-2 py-0.5 text-xs">
      {item.badge}
    </Badge>
  )}
</NavLink>
```

3. If the NavGroup receives a `title` prop, conditionally render a small label above the items:

```tsx
{title && (
  <div className="px-5 py-1 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
    {title}
  </div>
)}
```

- [ ] **Step 4: Verify sidebar visually**

Run the dev server, log in, and check:
- Sidebar has rounded top-right and bottom-right corners (3xl = 48px radius)
- Active nav item has navy gradient background with white text
- Inactive items have gray pill backgrounds on hover
- Sidebar background is #f4f3f7

---

### Task 4: Restyle AppHeader

**Files:**
- Modify: `client/src/modules/shell/components/app-header.tsx`

- [ ] **Step 1: Restyle AppHeader**

Read `app-header.tsx`. Replace the entire component with:

```tsx
import { SidebarTrigger } from '@/shared/ui/shadcn/sidebar';
import { LanguageSwitcher } from './language-switcher';
import { ModeSwitcher } from './mode-switcher';
import { SearchMenu } from './search-menu';
import { cn } from '@/shared/utils/cn';

export function AppHeader() {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex items-center justify-between gap-6 border-b px-6 py-3',
        'bg-surface/80 backdrop-blur-xl',
        'shadow-[0_12px_32px_rgba(26,27,30,0.06)]'
      )}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2" />
        <span className="font-headline text-xl font-bold text-primary hidden sm:block">
          Easy English
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <SearchMenu />
        <ModeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify**

Check header: glass blur effect visible, subtle shadow, workspace name in navy Lexend font.

---

### Task 5: Update Authenticated Layout Padding

**Files:**
- Modify: `client/src/modules/shell/pages/authenticated-layout.tsx`

- [ ] **Step 1: Update content wrapper**

Read `authenticated-layout.tsx`. Find the content div:

```tsx
<div className="relative z-50 mx-auto flex w-full max-w-[1360px] flex-1 flex-col self-stretch p-4 md:p-6">
```

Update to add left margin for the fixed sidebar and adjust top padding:

```tsx
<div className="ml-64 pt-20 p-12 max-w-[1400px] mx-auto flex flex-1 flex-col self-stretch">
```

Also update the outer wrapper to ensure it has the warm white surface background:

```tsx
<div className="flex flex-1 flex-col h-full bg-surface">
```

---

### Task 6: Create StudySessionHeader Component

**Files:**
- Create: `client/src/modules/learning/components/study-session-header.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/modules/learning/components/study-session-header.tsx`:

```tsx
import { X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { LearnRoutes } from '@/shared/constants';
import { Button } from '@/shared/ui/shadcn/button';
import { cn } from '@/shared/utils/cn';

interface StudySessionHeaderProps {
  workspaceName?: string;
  sessionType?: string;
  streak?: number;
  timer?: string;
  current?: number;
  total?: number;
  progressPercent?: number;
  onExit?: () => void;
}

export function StudySessionHeader({
  workspaceName = 'Scholarly Sanctuary',
  sessionType,
  streak = 0,
  timer = '00:00',
  current = 0,
  total = 0,
  progressPercent = 0,
  onExit,
}: StudySessionHeaderProps) {
  const navigate = useNavigate();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate({ to: LearnRoutes.base() });
    }
  };

  return (
    <header className="w-full px-6 py-4 flex flex-col gap-4 sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
        {/* Top row: close + workspace + stats */}
        <div className="flex justify-between items-center gap-4">
          {/* Left: exit + workspace */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
            <span className="font-headline font-bold text-lg text-primary hidden sm:block">
              {workspaceName}
            </span>
          </div>

          {/* Right: stats */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 font-headline font-bold text-sm">
                <span>🔥</span>
                <span>{streak}</span>
              </div>
            )}

            {/* Session type */}
            {sessionType && (
              <div className="hidden md:flex items-center gap-2 text-on-surface-variant font-label text-sm font-medium">
                <span>🎓</span>
                <span>Session: {sessionType}</span>
              </div>
            )}

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-headline font-semibold text-sm">
              <span>⏱</span>
              <span>{timer}</span>
            </div>
          </div>
        </div>

        {/* Progress row */}
        {total > 0 && (
          <div className="w-full flex items-center gap-4">
            <div className="flex-1 h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--tertiary-fixed-dim)',
                  boxShadow: '0 0 8px rgba(255, 185, 84, 0.4)',
                }}
              />
            </div>
            <span className="font-headline font-semibold text-sm text-on-surface-variant tracking-tighter whitespace-nowrap">
              {current} / {total}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify**

The component should compile without errors. Check that all imports resolve.

---

### Task 7: Commit Layout Shell

```bash
git add client/src/modules/shell/ client/src/modules/learning/components/study-session-header.tsx
git commit -m "feat(ui): restyle layout shell — MD3 sidebar, glass header, StudySessionHeader component"
```

---

## Phase 3: Learning Pages

### Task 8: Restyle Dashboard

**Files:**
- Modify: `client/src/modules/dashboard/pages/dashboard-page.tsx`
- Modify: `client/src/modules/dashboard/components/` (any existing stat card or progress components)

- [ ] **Step 1: Read current dashboard**

Read `client/src/modules/dashboard/pages/dashboard-page.tsx` and all component files in `dashboard/components/`.

- [ ] **Step 2: Restyle the page**

Key class updates for the page-level container:

```tsx
// Page wrapper — use the MD3 surface + warm background
<div className="space-y-8">
  {/* Hero Section */}
  <section className="relative flex items-center justify-between">
    <div className="max-w-2xl">
      <h1 className="font-headline text-5xl font-extrabold text-on-primary-fixed mb-4 tracking-tight">
        Welcome back, Scholar.
      </h1>
      <p className="text-lg text-on-surface-variant leading-relaxed">
        Your intellectual journey continues. You have{' '}
        <span className="font-bold text-primary">42 words</span> due for review today.
      </p>
    </div>
    <button className="bg-gradient-to-br from-primary to-primary-container text-white px-10 py-5 rounded-full font-headline font-bold text-lg shadow-lg hover:shadow-primary-container/20 transition-all flex items-center gap-3">
      <span>▶</span>
      Quick Start Study
    </button>
  </section>

  {/* Stat Cards — 3-column grid */}
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Each stat card: rounded-2xl, surface container, subtle border */}
    {stats.map((stat) => (
      <div
        key={stat.id}
        className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 shadow-sm"
      >
        {/* stat content */}
      </div>
    ))}
  </section>

  {/* Bottom CTA Banner */}
  <section className="rounded-3xl overflow-hidden relative h-48">
    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container" />
    {/* overlay content */}
  </section>
</div>
```

For each stat card component in `dashboard/components/`, update the card className to:
```tsx
className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 shadow-sm"
```

- [ ] **Step 3: Verify visually**

Navigate to `/dashboard`. Compare with `tmp/dashboard/screen.png`:
- ✅ Large Lexend heading in deep navy
- ✅ Quick Start button is pill-shaped with navy gradient
- ✅ Stat cards have rounded-2xl borders with surface-container background
- ✅ CTA banner has gradient overlay

---

### Task 9: Restyle Study Hub

**Files:**
- Modify: `client/src/modules/learning/pages/my-learning.page.tsx`
- Create: `client/src/modules/learning/components/bento-card.tsx` (if bento grid layout is new)

- [ ] **Step 1: Read current study hub page**

Read `client/src/modules/learning/pages/my-learning.page.tsx`.

- [ ] **Step 2: Apply hero + bento layout**

```tsx
<div className="space-y-8">
  {/* Hero */}
  <div>
    <h1 className="font-headline text-4xl font-bold text-primary mb-2">
      Easy English Study Hub
    </h1>
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-sm text-on-surface-variant">
      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
      Current Status: Resume Last Session
    </div>
  </div>

  {/* Words Due CTA Card — teal gradient */}
  <div className="rounded-3xl bg-gradient-to-br from-secondary to-[#00876e] p-8 text-white">
    <div className="flex items-center justify-between">
      <div>
        <div className="font-headline text-2xl font-bold mb-1">
          {dueCount} Words Due Today
        </div>
        <div className="text-white/80 text-sm">
          {vocabCount} vocabulary · {phraseCount} phrases
        </div>
      </div>
      <button className="bg-white text-secondary px-8 py-4 rounded-full font-headline font-bold text-lg shadow-lg">
        Start Review →
      </button>
    </div>
  </div>

  {/* Bento Grid — 2 columns */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Daily Review — large card */}
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 row-span-2">
      {/* Daily Review content */}
    </div>

    {/* Speed Quiz — small card */}
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
      {/* Speed Quiz content */}
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify**

Navigate to `/learning`. Compare with `tmp/study_hub/screen.png`:
- ✅ Hero heading in navy
- ✅ Teal gradient "Words Due Today" card
- ✅ Bento grid layout with Daily Review large and Speed Quiz small

---

### Task 10: Restyle Study Sessions (all 6 modes)

**Files:**
- Modify: `client/src/modules/learning/pages/study-session.page.tsx`
- Create: `client/src/modules/learning/components/study-session-layout.tsx`
- Modify: `client/src/modules/learning/components/quiz-view.tsx`
- Modify: `client/src/modules/learning/components/flashcard-view.tsx`

- [ ] **Step 1: Create StudySessionLayout wrapper**

Create `client/src/modules/learning/components/study-session-layout.tsx`:

```tsx
import { StudySessionHeader } from './study-session-header';
import { cn } from '@/shared/utils/cn';

interface StudySessionLayoutProps {
  children: React.ReactNode;
  workspaceName?: string;
  sessionType?: string;
  streak?: number;
  timer?: string;
  current?: number;
  total?: number;
  progressPercent?: number;
  onExit?: () => void;
}

export function StudySessionLayout({
  children,
  ...headerProps
}: StudySessionLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <StudySessionHeader {...headerProps} />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>
      {/* Watermark */}
      <div
        className="fixed bottom-4 right-8 text-[120px] font-headline font-black text-surface-container-highest/30 select-none pointer-events-none"
        style={{ lineHeight: 1 }}
      >
        Scholar
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update study-session.page.tsx**

Read `study-session.page.tsx`. Find where `AppSidebar` and `AppHeader` are rendered (likely via the authenticated layout) and replace the entire component to use `StudySessionLayout` instead. The page should not render the sidebar at all:

```tsx
return (
  <StudySessionLayout
    workspaceName="Scholarly Sanctuary"
    sessionType={currentTopicName}
    streak={streak}
    timer={formatTime(remainingSeconds)}
    current={currentIndex + 1}
    total={totalWords}
    progressPercent={((currentIndex + 1) / totalWords) * 100}
  >
    {/* current mode content — quiz, flashcard, etc. */}
  </StudySessionLayout>
);
```

- [ ] **Step 3: Restyle quiz-view.tsx**

Read `quiz-view.tsx`. Key visual changes:

```tsx
// Category badge
<div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium uppercase tracking-wide">
  {category}
</div>

// Word — large Lexend heading
<h2 className="font-headline text-4xl font-bold text-primary text-center mb-4">
  {word}
</h2>

// Definition
<p className="text-lg text-on-surface-variant text-center mb-8 italic">
  "{definition}"
</p>

// Option cards — 2x2 grid, rounded-2xl with surface-container bg
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {options.map((opt) => (
    <button
      key={opt.id}
      className={cn(
        'rounded-2xl border-2 p-4 text-left transition-all',
        'bg-surface-container hover:bg-surface-container-high hover:border-primary/30',
        selected === opt.id && 'border-primary bg-primary/5'
      )}
    >
      {opt.text}
    </button>
  ))}
</div>

// Confirm button — navy gradient pill
<button className="bg-gradient-to-br from-primary to-primary-container text-white rounded-full px-8 py-3 font-headline font-bold shadow-lg">
  Confirm Answer
</button>
```

- [ ] **Step 4: Verify each mode**

Navigate to `/learning/study` with different session modes. Compare with each HTML screenshot:
- ✅ `tmp/study_session_quiz_mode_updated_header/screen.png`
- ✅ `tmp/study_session_match_mode_updated_header/screen.png`
- ✅ `tmp/study_session_typing_mode/screen.png`
- ✅ `tmp/study_session_speaking_mode/screen.png`
- ✅ `tmp/study_session_listening_mode_updated_header/screen.png`
- ✅ `tmp/study_session_speed_mode_updated_header/screen.png`

---

### Task 11: Commit Learning Pages

```bash
git add client/src/modules/dashboard/ client/src/modules/learning/
git commit -m "feat(ui): restyle learning pages — dashboard, study hub, study sessions with MD3 theme"
```

---

### Task 12: Restyle Dictionary Search & Word Detail

**Files:**
- Modify: `client/src/modules/learning/pages/dictionary-search.page.tsx`
- Modify: `client/src/modules/learning/components/search-input.tsx`
- Modify: `client/src/modules/learning/components/search-results-list.tsx`
- Modify: `client/src/modules/learning/components/word-sense-card.tsx`
- Modify: `client/src/modules/learning/pages/word-sense-detail.page.tsx`
- Modify: `client/src/modules/learning/components/word-sense-detail.tsx`

- [ ] **Step 1: Restyle dictionary-search page**

Key changes to `dictionary-search.page.tsx`:

```tsx
// Hero
<h1 className="font-headline text-4xl font-bold text-primary mb-2">
  Easy English Dictionary
</h1>
<p className="text-on-surface-variant text-lg mb-8">
  Search thousands of words with definitions, examples, and pronunciations.
</p>

// Search bar — large, full-width, rounded-full
<div className="relative w-full mb-6">
  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant h-5 w-5" />
  <input
    className="w-full rounded-full bg-surface-container border-none py-4 pl-14 pr-6 text-base
               focus:ring-2 focus:ring-primary-container transition-all shadow-sm"
    placeholder="Search for a word..."
  />
</div>

// Recent searches — pill chips
<div className="flex flex-wrap gap-2 mb-8">
  {recentSearches.map((term) => (
    <button
      key={term}
      className="px-4 py-1.5 rounded-full bg-surface-container text-sm text-on-surface-variant
                 hover:bg-surface-container-high transition-colors border border-outline-variant/20"
    >
      {term}
    </button>
  ))}
</div>

// Word cards grid — 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {words.map((word) => (
    <div
      key={word.id}
      className="rounded-2xl border border-outline-variant/20 bg-surface-container p-5 shadow-sm
                 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* POS badge — teal for adjective, blue for noun, amber for verb */}
      <div className={cn(
        'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide mb-2',
        word.pos === 'adjective' && 'bg-secondary/10 text-secondary',
        word.pos === 'noun' && 'bg-primary/10 text-primary',
        word.pos === 'verb' && 'bg-tertiary-fixed/20 text-tertiary'
      )}>
        {word.pos}
      </div>
      <h3 className="font-headline text-xl font-bold text-on-surface mb-1">{word.word}</h3>
      <p className="text-sm text-on-surface-variant italic mb-3">/{word.pronunciation}/</p>
      <p className="text-sm text-on-surface mb-3 line-clamp-2">{word.definition}</p>
      <button className="w-full rounded-full border border-secondary text-secondary py-2 text-sm font-medium
                        hover:bg-secondary/5 transition-colors">
        Add to Learning
      </button>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Restyle word-sense-detail page**

```tsx
// Part-of-speech badge + huge word
<div className="flex items-center gap-3 mb-6">
  <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium uppercase">
    {pos}
  </span>
</div>
<h1 className="font-headline text-6xl font-black text-primary mb-2">{word}</h1>
<p className="text-2xl text-on-surface-variant italic mb-8">/{pronunciation}/</p>

// Two-column layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Left — 2 cols: definition, examples, synonyms, antonyms */}
  <div className="lg:col-span-2 space-y-6">
    <div>
      <h3 className="font-headline text-lg font-semibold mb-3">Definition</h3>
      <p className="text-on-surface leading-relaxed">{definition}</p>
    </div>

    {/* Examples with amber bullets */}
    <div>
      <h3 className="font-headline text-lg font-semibold mb-3">Examples</h3>
      <ul className="space-y-2">
        {examples.map((ex) => (
          <li key={ex} className="flex gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim shrink-0" />
            <span className="text-on-surface italic">"{ex}"</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Synonyms — teal pills */}
    <div>
      <h3 className="font-headline text-lg font-semibold mb-3">Synonyms</h3>
      <div className="flex flex-wrap gap-2">
        {synonyms.map((s) => (
          <span key={s} className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm">
            {s}
          </span>
        ))}
      </div>
    </div>

    {/* Antonyms — coral pills */}
    <div>
      <h3 className="font-headline text-lg font-semibold mb-3">Antonyms</h3>
      <div className="flex flex-wrap gap-2">
        {antonyms.map((a) => (
          <span key={a} className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
            {a}
          </span>
        ))}
      </div>
    </div>
  </div>

  {/* Right sidebar — mastery + CTA */}
  <div className="space-y-4">
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
      <div className="text-sm text-on-surface-variant mb-1">Mastery Level</div>
      <div className="font-headline text-3xl font-bold text-primary">{masteryPercent}%</div>
      <div className="h-2 bg-surface-container-high rounded-full mt-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-secondary"
          style={{ width: `${masteryPercent}%` }}
        />
      </div>
    </div>

    <button className="w-full bg-gradient-to-br from-primary to-primary-container text-white
                       rounded-full py-3 font-headline font-bold shadow-lg">
      Study Now
    </button>
  </div>
</div>
```

- [ ] **Step 3: Verify**

Navigate to `/dictionary` and `/dictionary/senses/$senseId`. Compare with `tmp/dictionary_search/screen.png` and `tmp/word_detail/screen.png`.

---

### Task 13: Restyle Topics

**Files:**
- Modify: `client/src/modules/topic/pages/topics.page.tsx`
- Modify: `client/src/modules/topic/components/topic-card.tsx`

- [ ] **Step 1: Restyle topics page**

```tsx
// Hero — italic Lexend
<h1 className="font-headline text-4xl font-bold italic text-primary mb-8">
  Explore Your Linguistic Realms
</h1>

// Category tabs — pill tabs
<div className="flex flex-wrap gap-2 mb-8">
  {categories.map((cat) => (
    <button
      key={cat}
      className={cn(
        'px-5 py-2 rounded-full text-sm font-medium transition-all',
        activeCategory === cat
          ? 'bg-gradient-to-br from-primary to-primary-container text-white shadow-md'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
      )}
    >
      {cat}
    </button>
  ))}
</div>

// Topic cards grid — 2 columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  {topics.map((topic) => (
    <div
      key={topic.id}
      className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6
                 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Status badge */}
      {topic.status && (
        <span className="inline-block px-3 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium uppercase mb-3">
          {topic.status}
        </span>
      )}
      <h3 className="font-headline text-lg font-semibold text-on-surface mb-2">{topic.name}</h3>
      <p className="text-sm text-on-surface-variant mb-4">{topic.description}</p>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-tertiary-fixed-dim"
            style={{ width: `${topic.progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
          {topic.progressPercent}%
        </span>
      </div>

      <div className="text-xs text-on-surface-variant">{topic.wordCount} words</div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Verify**

Navigate to `/topics`. Compare with `tmp/topics/screen.png`:
- ✅ Italic heading in navy
- ✅ Pill category tabs with active gradient state
- ✅ Topic cards with rounded-2xl borders and progress bars

---

### Task 14: Commit Dictionary, Word Detail & Topics

```bash
git add client/src/modules/learning/ client/src/modules/topic/
git commit -m "feat(ui): restyle dictionary, word detail, and topics pages with MD3 theme"
```

---

## Phase 4: Workspace Pages

### Task 15: Restyle Workspace Switcher & Settings

**Files:**
- Modify: `client/src/modules/workspace/components/workspace-switcher.tsx`
- Create: `client/src/modules/workspace/pages/workspace-settings.page.tsx`

- [ ] **Step 1: Restyle workspace-switcher.tsx**

Key changes for the switcher component:

```tsx
// Workspace cards
<div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6
               hover:shadow-md transition-shadow cursor-pointer">
  <div className="flex items-start justify-between mb-4">
    <div className="font-headline text-lg font-semibold text-on-surface">{ws.name}</div>
    {ws.isActive && (
      <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
        Active
      </span>
    )}
  </div>
  <div className="text-sm text-on-surface-variant mb-1">{ws.wordCount} words · {ws.masteredCount} mastered</div>
  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-3">
    <div
      className="h-full rounded-full bg-secondary"
      style={{ width: `${(ws.masteredCount / ws.wordCount) * 100}%` }}
    />
  </div>
</div>

// Stats grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {stats.map((stat) => (
    <div key={stat.id} className="rounded-2xl bg-surface-container p-5 text-center">
      <div className="font-headline text-2xl font-bold text-primary">{stat.value}</div>
      <div className="text-xs text-on-surface-variant mt-1">{stat.label}</div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Create workspace-settings page**

Create `client/src/modules/workspace/pages/workspace-settings.page.tsx`. Read `tmp/workspace_settings/screen.png` for visual reference:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/shadcn/tabs';
import { Input } from '@/shared/ui/shadcn/input';
import { Button } from '@/shared/ui/shadcn/button';

export default function WorkspaceSettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-headline text-4xl font-bold text-primary">Workspace Settings</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="rounded-full bg-surface-container p-1 mb-8">
          <TabsTrigger value="overview" className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="workspace" className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            Workspace Settings
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Core Identity Card */}
            <div className="lg:col-span-2 rounded-2xl border border-outline-variant/20 bg-surface-container p-6 space-y-4">
              <h3 className="font-headline text-lg font-semibold">Core Identity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">Workspace Name</label>
                  <Input className="rounded-xl" defaultValue="Scholarly Sanctuary" />
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">Daily Target</label>
                  <Input className="rounded-xl" type="number" defaultValue="10" />
                </div>
              </div>
            </div>

            {/* Milestone Badge */}
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-primary-container mb-3" />
              <div className="font-headline text-lg font-bold">Level 12 Philosopher</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workspace">
          {/* Learning Methodology */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
              <h3 className="font-headline font-semibold mb-2">Spaced Repetition</h3>
              <p className="text-sm text-on-surface-variant">Review words at increasing intervals to maximize retention.</p>
            </div>
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
              <h3 className="font-headline font-semibold mb-2">Immersion Sprint</h3>
              <p className="text-sm text-on-surface-variant">Intensive sessions to rapidly expand your vocabulary.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="font-headline font-semibold text-destructive mb-2">Danger Zone</h3>
            <p className="text-sm text-on-surface-variant mb-4">This action is irreversible.</p>
            <Button variant="destructive" className="rounded-full">Archive Workspace</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Navigate to `/workspace` (switcher) and `/workspace/settings` (new page). Compare with `tmp/workspace_switcher/screen.png` and `tmp/workspace_settings/screen.png`.

---

### Task 16: Restyle Workspace Setup Wizard (all 4 steps)

**Files:**
- Modify: `client/src/modules/workspace/pages/new-workspace.page.tsx`
- Modify: `client/src/modules/workspace/components/new-wizard/workspace-wizard.tsx`
- Modify: `client/src/modules/workspace/components/new-wizard/workspace-basics-step.tsx`
- Modify: `client/src/modules/workspace/components/new-wizard/workspace-learning-step.tsx`
- Modify: `client/src/modules/workspace/components/new-wizard/workspace-preferences-step.tsx`
- Modify: `client/src/modules/workspace/components/new-wizard/workspace-review-step.tsx`

- [ ] **Step 1: Read and understand wizard structure**

Read all wizard component files to understand the current layout.

- [ ] **Step 2: Restyle workspace-wizard.tsx — main layout**

```tsx
// Main wrapper — two columns: stepper + content
<div className="flex gap-12 max-w-5xl mx-auto">
  {/* Left: vertical stepper */}
  <div className="w-48 shrink-0">
    <div className="space-y-0">
      {steps.map((step, idx) => (
        <div key={step.id} className="relative pl-6 py-3">
          {/* Active indicator bar */}
          {idx < currentStep && (
            <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-primary" />
          )}
          {/* Step number circle */}
          <div className={cn(
            'absolute left-0 top-3 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
            idx < currentStep && 'bg-primary text-white',
            idx === currentStep && 'bg-primary text-white ring-4 ring-primary/20',
            idx > currentStep && 'bg-surface-container text-on-surface-variant'
          )}>
            {idx < currentStep ? '✓' : idx + 1}
          </div>
          <div className={cn(
            'text-sm font-medium',
            idx === currentStep ? 'text-primary font-semibold' : 'text-on-surface-variant'
          )}>
            {step.label}
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Right: step content */}
  <div className="flex-1">
    {/* Progress bar */}
    <div className="flex items-center gap-3 mb-8">
      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-tertiary-fixed-dim"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
        STEP {currentStep + 1} OF {steps.length}
      </span>
    </div>

    {/* Step content */}
    {renderStepContent()}
  </div>
</div>
```

- [ ] **Step 3: Restyle each step component**

For `workspace-basics-step.tsx`:
```tsx
<h2 className="font-headline text-3xl font-bold text-primary mb-2">
  Begin your scholarly journey
</h2>
<p className="text-on-surface-variant mb-8">
  Create a dedicated space for your language learning adventure.
</p>

{/* Feature cards at bottom */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
  {features.map((feat) => (
    <div key={feat.title} className="rounded-2xl bg-surface-container p-5 text-center">
      <div className="text-3xl mb-2">{feat.icon}</div>
      <div className="font-headline font-semibold text-sm mb-1">{feat.title}</div>
      <div className="text-xs text-on-surface-variant">{feat.desc}</div>
    </div>
  ))}
</div>
```

For navigation buttons in `workspace-wizard.tsx`:
```tsx
<div className="flex justify-between mt-8 pt-6 border-t border-outline-variant/20">
  <button
    onClick={onBack}
    className="rounded-full border border-outline px-6 py-3 text-on-surface-variant
               hover:bg-surface-container transition-colors"
  >
    Back
  </button>
  <button
    onClick={onNext}
    className="bg-gradient-to-br from-primary to-primary-container text-white
               rounded-full px-8 py-3 font-headline font-bold shadow-lg"
  >
    Continue
  </button>
</div>
```

For `workspace-review-step.tsx`:
```tsx
// Create Workspace CTA
<button className="w-full bg-gradient-to-br from-primary to-primary-container text-white
                   rounded-full py-4 font-headline font-bold text-lg shadow-lg">
  Create Workspace
</button>
```

- [ ] **Step 4: Verify**

Navigate to `/workspace/new`. Compare with `tmp/workspace_setup_step_1_v1/screen.png`, `step_2`, `step_3`, and `step_4_review/screen.png`.

---

### Task 17: Final Commit

```bash
git add client/src/modules/workspace/
git commit -m "feat(ui): restyle workspace pages — switcher, settings, setup wizard with MD3 theme"
```

---

## Verification Checklist

After each phase, verify:

1. **Light mode**: Run `cd client && npm run dev`, navigate to each page, compare with the corresponding `tmp/*/screen.png`
2. **Dark mode**: Toggle dark mode, verify colors adapt (navy → light navy, teal → bright teal)
3. **Sidebar**: Test collapsed/expanded states — rounded corners should remain
4. **Lint**: Run `cd client && npm run lint` — should have zero errors
5. **Build**: Run `cd client && npm run build` — must compile without errors

## File Summary

| File | Task |
|------|------|
| `client/src/styles/globals.css` | Task 1 |
| `client/src/shared/ui/design-tokens/colors.ts` | Task 2 |
| `client/src/shared/ui/design-tokens/typography.ts` | Task 2 |
| `client/src/shared/ui/design-tokens/radius.ts` | Task 2 |
| `client/src/modules/shell/components/app-sidebar.tsx` | Task 3 |
| `client/src/modules/shell/ui/nav-group.tsx` | Task 3 |
| `client/src/modules/shell/components/app-header.tsx` | Task 4 |
| `client/src/modules/shell/pages/authenticated-layout.tsx` | Task 5 |
| `client/src/modules/learning/components/study-session-header.tsx` | Task 6 |
| `client/src/modules/dashboard/pages/dashboard-page.tsx` | Task 8 |
| `client/src/modules/dashboard/components/*.tsx` | Task 8 |
| `client/src/modules/learning/pages/my-learning.page.tsx` | Task 9 |
| `client/src/modules/learning/pages/study-session.page.tsx` | Task 10 |
| `client/src/modules/learning/components/study-session-layout.tsx` | Task 10 |
| `client/src/modules/learning/components/quiz-view.tsx` | Task 10 |
| `client/src/modules/learning/components/flashcard-view.tsx` | Task 10 |
| `client/src/modules/learning/pages/dictionary-search.page.tsx` | Task 12 |
| `client/src/modules/learning/components/search-input.tsx` | Task 12 |
| `client/src/modules/learning/components/search-results-list.tsx` | Task 12 |
| `client/src/modules/learning/components/word-sense-card.tsx` | Task 12 |
| `client/src/modules/learning/pages/word-sense-detail.page.tsx` | Task 12 |
| `client/src/modules/learning/components/word-sense-detail.tsx` | Task 12 |
| `client/src/modules/topic/pages/topics.page.tsx` | Task 13 |
| `client/src/modules/topic/components/topic-card.tsx` | Task 13 |
| `client/src/modules/workspace/components/workspace-switcher.tsx` | Task 15 |
| `client/src/modules/workspace/pages/workspace-settings.page.tsx` | Task 15 |
| `client/src/modules/workspace/pages/new-workspace.page.tsx` | Task 16 |
| `client/src/modules/workspace/components/new-wizard/*.tsx` | Task 16 |
