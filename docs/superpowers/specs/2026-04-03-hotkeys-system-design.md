# Hotkeys System Design

**Date:** 2026-04-03
**Status:** Approved
**Stack:** `@tanstack/react-hotkeys` v0.9.1, React 19, TypeScript, Zustand

---

## 1. Overview

A production-ready hotkey system for the Easy English V2 React app that supports:

- Global hotkeys (always active)
- Page-scoped hotkeys (auto-pushed via TanStack Router)
- Dialog/modal-scoped hotkeys (manual push/pop via hook)
- Nested scope stack with priority resolution
- Shortcut modal (`Ctrl+/`) showing all active hotkeys grouped by feature
- Runtime conflict detection (`console.warn`) — built into TanStack
- Enable/disable per hotkey
- Single global event listener (performance)

**Library choice:** `@tanstack/hotkeys` v0.7.1 is already installed. It provides key string parsing. It is **framework-agnostic** — no scope system, no React provider built in. We build our own scope management on top.

**Key architectural discovery (vs. initial design):**
- `hotkey-registry.ts` (Zustand) — **NOT needed**. `HotkeyManager.registrations` IS the registry.
- `scope-stack.ts` (Zustand) — **needed**. Custom scope management (TanStack has no scope concept).
- Scope priority via **capture-phase interception**: we intercept before TanStack's default bubble-phase listeners.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HotkeysProvider                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  HotkeyManager.registrations (core)              │  │
│  │  - conflictBehavior: 'warn' built-in             │  │
│  │  - NO scope system — we add our own layer       │  │
│  │  useHotkeyRegistrations() (react adapter)       │  │
│  │  - reactive hook reads all registrations          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  scopeStackStore (Zustand)                       │  │
│  │  - stack: string[]  →  ["global","dashboard"]   │  │
│  │  - push / pop / getActiveScopes                  │  │
│  │  - resolvePriority(scope): number                │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Capture-phase keydown listener (ONE global)     │  │
│  │  1. Find all matching registrations              │  │
│  │  2. Filter to scopes in active stack            │  │
│  │  3. Sort by priority (last in stack = highest)  │  │
│  │  4. Fire topmost handler                        │  │
│  │  5. stopImmediatePropagation() → blocks         │  │
│  │     TanStack's default bubble handler            │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ShortcutsModal (opened via Ctrl+/)               │  │
│  │  - Tabs: one per active scope                     │  │
│  │  - Grouped hotkey list per tab                    │  │
│  │  - Search filters across all scopes               │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### How capture-phase interception works

TanStack's `HotkeyManager` fires every matching handler in Map insertion order (bubble phase). We intercept at the **capture phase** (runs before bubble):

1. `useHotkey` calls `manager.register(..., { stopPropagation: false })`
2. `HotkeysProvider` adds ONE `keydown` listener on `document` with `{ capture: true }`
3. Capture handler: finds all matching registrations, filters to active scopes, sorts by priority, fires only the topmost handler
4. After firing, calls `event.stopImmediatePropagation()` — this prevents TanStack's own bubble listener from firing for scope-aware hotkeys
5. Global hotkeys (`scope: 'global'`) are always included in priority resolution

### Scope Stack Behavior

| Action | Effect |
|--------|--------|
| App boot | Stack initialized as `["global"]` |
| Navigate to page | `pushScope("page-name")` via `getRouteScopeConfig` |
| Leave page | `popScope()` via `getRouteScopeConfig` |
| Open dialog | `pushScope("dialog-name")` via `useHotkeyScope` |
| Close dialog | `popScope()` via `useHotkeyScope` |
| Global hotkeys | Always active regardless of stack |

### Priority Resolution

Higher position in stack = higher priority.

```
Stack: ["global", "dashboard", "create-dialog"]
Event: Ctrl+Enter

1. Find all registrations matching "ctrl+enter"
2. Filter: keep those whose scope is in stack
3. Sort by scope position (last in stack = highest priority)
4. Execute topmost handler + stopImmediatePropagation()
```

### Conflict Detection

Uses TanStack's built-in `conflictBehavior: 'warn'`:
- Same hotkey + same target → `console.warn` at registration time
- Same hotkey in different scopes → intentional override, no warn
- `group` is display-only metadata, not used in resolution

---

## 3. File Structure

```
client/src/features/hotkeys/
├── types.ts               # Shared TypeScript types (HotkeyMeta, HotkeyOptions)
├── scope-stack.ts         # Zustand: scope stack + resolvePriority
├── use-hotkey.ts         # Main hook: manager.register() + metadata in meta
├── use-hotkey-scope.ts   # Manual push/pop hook (dialogs, panels)
├── use-hotkey-route.ts   # Auto push/pop via TanStack Router beforeLoad/onLeave
├── hotkeys-provider.tsx  # Root provider: capture-phase listener + Ctrl+/ modal
├── shortcut-modal.tsx    # Modal UI
└── index.ts              # Public exports
```

Note: `hotkey-registry.ts` and `parse-hotkey.ts` from the original plan are NOT created — TanStack provides both.

---

## 4. API Design

### `useHotkey(keys, handler, options?)`

```tsx
import { useHotkey } from '@features/hotkeys';

function CreateDialog() {
  useHotkey('ctrl+enter', () => handleSubmit(), {
    description: 'Submit form',
    group: 'Dialog Actions',
    scope: 'create-dialog',   // optional: auto-inferred from stack top
    enabled: isValid,          // optional: runtime toggle
  });

  useHotkey('escape', () => handleClose(), {
    description: 'Close dialog',
    group: 'Dialog Actions',
    scope: 'create-dialog',
  });
}
```

**Internals:**
- Calls `getHotkeyManager().register(keys, handler, { meta: { description, group, scope }, enabled, conflictBehavior: 'warn', preventDefault: true, stopPropagation: false })`
- `stopPropagation: false` — the capture handler owns propagation control
- Unregisters on unmount, re-registers when options change

### `useHotkeyScope(scope, options?)`

```tsx
import { useHotkeyScope } from '@features/hotkeys';

// Auto push on mount, pop on unmount
const { pushScope, popScope } = useHotkeyScope('create-dialog', {
  onMount: 'push',  // default
});
```

### `getRouteScopeConfig(scope)` (from `use-hotkey-route.ts`)

```tsx
import { getRouteScopeConfig } from '@features/hotkeys';

export const Route = createFileRoute('/dashboard')({
  ...getRouteScopeConfig('dashboard'),
  component: DashboardPage,
});
```

### `ShortcutsModal`

```tsx
import { ShortcutsModal } from '@features/hotkeys';

// Opened via global Ctrl+/ hotkey (registered inside HotkeysProvider)
<ShortcutsModal open={open} onOpenChange={setOpen} />
```

---

## 5. Component Specifications

### `HotkeysProvider`

- Wraps app at root level (inside `QueryClientProvider`)
- Initializes `global` scope on store creation
- Registers global `Ctrl+/` shortcut to open the modal
- Adds ONE capture-phase `keydown` listener on `document`
- Renders `ShortcutsModal` (opens/closes via internal state)

### Capture Handler Logic

```tsx
const captureHandler = (event: KeyboardEvent) => {
  // 1. Find all registrations matching this keyboard event
  const matching = [...registrations.values()].filter((reg) =>
    matchesKeyboardEvent(event, reg.parsedHotkey, reg.options.platform)
  );
  if (matching.length === 0) return;

  // 2. Filter to scopes in the active stack
  const active = useScopeStackStore.getState().stack;
  const inScope = matching.filter((reg) => {
    const s = (reg.options.meta as HotkeyMeta)?.scope ?? 'global';
    return active.includes(s);
  });
  if (inScope.length === 0) return;

  // 3. Sort by scope priority (last in stack = highest)
  inScope.sort((a, b) => {
    const sa = active.indexOf((a.options.meta as HotkeyMeta)?.scope ?? 'global');
    const sb = active.indexOf((b.options.meta as HotkeyMeta)?.scope ?? 'global');
    return sb - sa;
  });

  // 4. Fire topmost handler
  const top = inScope[0];
  top.callback(event, { hotkey: top.hotkey, parsedHotkey: top.parsedHotkey });

  // 5. Block TanStack's bubble handler
  event.stopImmediatePropagation();
};
```

### `ShortcutsModal`

**Trigger:** `Ctrl+/` (registered globally in `HotkeysProvider`)

**Layout:**
```
┌──────────────────────────────────────────────┐
│  Keyboard Shortcuts                    [Esc] │
├──────────────────────────────────────────────┤
│  [global] [dashboard] [create-dialog]  [🔍] │  ← Scope tabs + search
├──────────────────────────────────────────────┤
│  Navigation                                  │
│    Ctrl + K    Open command palette           │
│                                              │
│  Dialog Actions                              │
│    Ctrl + Enter  Submit form                  │
│    Escape        Close dialog                 │
└──────────────────────────────────────────────┘
```

**Behaviors:**
- Tabs = one per active scope in the stack (including `global`)
- Search filters hotkeys across all scopes simultaneously
- Group by `meta.group`, filter by `meta.scope`
- Empty state: "No shortcuts found"
- Each row: `CommandKeyBox` badges + description + group label
- `Esc` closes modal
- Style: shadcn `Dialog`

### `CommandKeyBox`

Reuse existing `client/src/shared/ui/common/command-key-box.tsx`.

---

## 6. Type Definitions

```ts
// types.ts

export type HotkeyScope = string;

export interface HotkeyMeta {
  description?: string;
  group?: string;
  scope?: HotkeyScope;  // defaults to top of stack when omitted
}

export interface HotkeyOptions {
  description?: string;
  group?: string;
  scope?: HotkeyScope;
  enabled?: boolean;
}

export interface UseHotkeyScopeOptions {
  onMount?: 'push' | 'none';  // default: 'push'
}
```

---

## 7. Performance

- **Single capture listener:** One `keydown` capture listener in `HotkeysProvider`. TanStack's bubble listeners are bypassed via `stopImmediatePropagation`.
- **Built-in registry:** `HotkeyManager.registrations` is the store — no extra Zustand registry.
- **Lazy modal:** `ShortcutsModal` rendered inline (not code-split for simplicity; revisit if needed).
- **No re-registration on scope change:** scope changes don't trigger `useHotkey` re-registration — the capture handler dynamically resolves the right handler from the live registry.

---

## 8. Dependencies & Setup

`@tanstack/hotkeys` v0.7.1 is already in `package.json`.

In `root.tsx`:

```tsx
import { HotkeysProvider } from '@features/hotkeys';
import { Providers } from './shared/contexts/index.tsx';

<Providers>
  <HotkeysProvider>
    <Outlet />
  </HotkeysProvider>
</Providers>
```

---

## 9. Migration Plan

1. Create `features/hotkeys/` with all files ✅
2. Wire `HotkeysProvider` into `root.tsx` ✅
3. Migrate `modules/learning/hooks/use-keyboard-shortcuts.ts` → `useHotkey()` ✅
   - Removed `react-hotkeys-hook` dependency
   - Added `useHotkeyScope('study-session', { onMount: 'push' })` for session scoping
   - Replaced `useHotkeys('1, 2, 3, 4', ...)` with individual `useHotkey('1', ...)`, etc.
4. Add `getRouteScopeConfig` to dashboard and other page routes — pending

---

## 10. Rejected Approaches

| Approach | Why Rejected |
|----------|-------------|
| `hotkey-registry.ts` Zustand store | `HotkeyManager.registrations` IS the registry — no duplication needed |
| Custom key parser | TanStack's `matchesKeyboardEvent` + `parseHotkey` handle this |
| Bubble-phase intercept | Would still fire TanStack's handlers; capture-phase + `stopImmediatePropagation` is cleaner |
| Per-target elements for scope isolation | Requires refs in every page/dialog; capture handler is simpler |
| Conflict as dev-time CLI | Built-in `conflictBehavior: 'warn'` is sufficient |
