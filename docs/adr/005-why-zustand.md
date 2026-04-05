# ADR-005: Why Zustand

> Architecture Decision Record — Client-side state management for ephemeral UI state.

## Status

**Accepted**

---

## Context

The React client needs to manage:
- Authentication state (access token, user info) — **persistent**, must survive page reloads
- Workspace creation wizard state — **ephemeral**, lives in memory only
- Dictionary search state — **ephemeral**, in-memory query and results
- Study session state — **ephemeral**, current card index, timer

This state is **not** server data (that's TanStack Query's job). It is client-side UI state.

---

## Decision

We use **Zustand** for all client-side state management:

- Auth store is **persistent** — stored in `localStorage` via Zustand's `persist` middleware
- Module stores (search, wizard, study) are **ephemeral** — in-memory only
- Action functions are exposed via selector hooks (`useAuthActions`, `useUser`)

---

## Consequences

### Positive

- **Minimal boilerplate** — No `createContext`, no `useReducer`. One `create()` call with typed state.
- **Selector pattern** — Only re-renders when selected state changes. No unnecessary renders.
- **Middleware support** — `persist` middleware for auth state, `devtools` for debugging.
- **Works with Suspense** — No conflicts with React 19 features.
- **Small bundle** — ~1KB gzipped. No framework overhead.
- **Async actions native** — `create<State>()((set, get) => ({ async fetch() { ... } }))`

### Negative

- **No DevTools for dev** — Zustand DevTools are browser-extension-based; debugging requires setup.
- **No built-in undo/redo** — Would need a middleware like `redux-undo`.
- **Action colocation** — Actions live on the store, not in separate files (can be mitigated with custom hooks).

---

## Alternatives Considered

| Approach | Why Not Chosen |
|---------|----------------|
| **Zustand (chosen)** | Best DX, minimal boilerplate, persist middleware built-in |
| Redux Toolkit | Too much boilerplate, overkill for this app size |
| Recoil | Deprecated/archived by Meta |
| Context + useReducer | Boilerplate for the boilerplate, no selector optimization |
| Jotai | Good alternative, but Zustand's persist is more ergonomic for auth state |

---

## Implementation Notes

### Auth Store (Persistent)

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      actions: {
        setToken: (accessToken) => set({ accessToken, isAuthenticated: true }),
        clear: () => set({ user: null, accessToken: null, isAuthenticated: false }),
        setUser: (user) => set({ user, isAuthenticated: !!user }),
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
);
```

### Selector Hook Pattern

```typescript
// Only re-renders when isAuthenticated changes
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);

// Only re-renders when user changes
export const useUser = () => useAuthStore((state) => state.user);

// Only re-renders when actions object reference changes
export const useAuthActions = () => useAuthStore((state) => state.actions);
```

### When NOT to Use Zustand

| Use TanStack Query Instead | Because |
|--------------------------|---------|
| API data | TanStack Query caches, refetches, and handles errors |
| Data shared between routes | TanStack Query cache survives navigation |
| Loading states for API calls | TanStack Query has built-in `isLoading`, `isFetching` |

---

## Related Decisions

- [ADR-004: Why TanStack Query](./004-why-tanstack-query.md) — Server state management
- [State Management](../frontend/state-management.md) — Full implementation guide
