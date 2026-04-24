# State Management

> Client-side state management strategy using Zustand and TanStack Query.

---

## 1. State Architecture

The frontend uses a two-layer state model:

```
┌──────────────────────────────────────────────────────────────┐
│                    Zustand (Client State)                   │
│                                                               │
│  AuthStore ──── User, accessToken, isAuthenticated          │
│  SearchStore ──── Dictionary search query, results           │
│  StudySessionStore ── Current session cards, progress       │
│  WizardStore ──── Workspace creation wizard state            │
└──────────────────────────────────────────────────────────────┘
                              │ TanStack Query fetches
                              │ from API, manages cache
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                TanStack Query (Server State)                  │
│                                                               │
│  • Due cards (auto-refetched)                               │
│  • Topics list                                               │
│  • Flashcard collection                                       │
│  • Learning list                                             │
│  • Study session state                                       │
└──────────────────────────────────────────────────────────────┘
```

**Rule of thumb:**
- Use **Zustand** for ephemeral UI state (modals, wizard steps, search input)
- Use **TanStack Query** for any data that comes from the API

---

## 2. Zustand — Auth Store

The auth store is the only **persistent** Zustand store (persists to `localStorage`):

```typescript
// File: client/src/shared/stores/auth-store.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: UserResponseDto | null;
  accessToken: TokenResultDto | null;
  isAuthenticated: boolean;
  actions: {
    setToken: (accessToken: TokenResultDto) => void;
    clear: () => void;
    setUser: (user: UserResponseDto | null) => void;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      actions: {
        setToken: (accessToken) => {
          set({ accessToken, isAuthenticated: true });
        },
        clear: () => {
          set({ user: null, accessToken: null, isAuthenticated: false });
        },
        setUser: (user) => {
          set({ user, isAuthenticated: !!user });
        },
      },
    }),
    {
      name: 'auth-storage',       // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({  // Only persist these fields
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Convenience selectors
export const useAuthActions = () => useAuthStore((s) => s.actions);
export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
```

**What gets persisted:** `user`, `accessToken`, `isAuthenticated` — stored in `localStorage['auth-storage']`.

**What does NOT get persisted:** The `actions` object is not persisted (it's recreated on reload).

---

## 3. Zustand — Module Stores

Each feature module may have its own Zustand store for ephemeral UI state:

### Search Store

```typescript
// File: client/src/modules/learning/stores/use-search-store.ts
interface SearchState {
  query: string;
  results: WordSense[];
  isSearching: boolean;
  // actions: setQuery, clearResults, etc.
}
```

### Study Session Store

```typescript
// File: client/src/modules/learning/stores/use-study-session-store.ts
interface StudySessionState {
  sessionId: string | null;
  cards: DueCardView[];
  currentIndex: number;
  // actions: startSession, recordReview, completeSession
}
```

### Workspace Wizard Store

```typescript
// File: client/src/modules/workspace/stores/use-wizard-store.ts
interface WizardState {
  currentStep: number;
  workspaceName: string;
  workspaceType: WorkspaceType;
  learningLevel: Level;
  // ... form state for all wizard steps
}
```

---

## 4. TanStack Query — Patterns

### Query Hook Pattern

All API data fetching follows this pattern:

```typescript
// File: client/src/modules/learning/hooks/use-due-cards.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/api.client';
import type { DueCardsResponse } from '../types';

export function useDueCards() {
  return useQuery<DueCardsResponse, ApiRequestError>({
    queryKey: ['due-cards'],
    queryFn: async () => {
      const response = await api.get('/learning/study/due');
      return (response as ApiSuccessResponse<DueCardsResponse>).data;
    },
    staleTime: 1000 * 60, // 1 minute — due cards don't change often
  });
}
```

### Mutation Hook Pattern

```typescript
// File: client/src/modules/learning/hooks/use-start-session.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/api.client';

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StartSessionPayload) => {
      const response = await api.post('/learning/study/sessions', payload);
      return (response as ApiSuccessResponse<SessionView>).data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['study-session'] });
    },
  });
}
```

---

## 5. API Response Envelope Handling

The API returns all responses in an envelope format. The `api.client.ts` interceptor unwraps it:

```typescript
// Success response envelope (from server)
{
  success: true,
  data: T,
  meta?: Record<string, unknown>,
  pagination?: { top, count, hasMore, skip, nextLink }
}

// Error response envelope (from server)
{
  success: false,
  error: {
    code: string,
    type: 'DOMAIN' | 'CLIENT' | 'SYSTEM' | 'NETWORK',
    message: string,
    details?: { field: string, message: string }[]
  },
  correlationId: string
}
```

The interceptor throws `ApiRequestError` for all envelope-format errors, which provides:

```typescript
error.isDomainError()     // Business logic error
error.isClientError()    // Validation error
error.getFieldError('email')  // Field-level validation message
```

---

## 6. Query Client Configuration

The query client is configured in `shared/contexts/query-client.ts`:

```typescript
// Default options applied to all queries/mutations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes
      gcTime: 1000 * 60 * 30,     // 30 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
```

### Per-Query Stale Times

| Data Type | Stale Time | Reasoning |
|-----------|-----------|-----------|
| Due cards | 1 min | Changes after each review |
| Flashcards list | 5 min | Stable unless user edits |
| Topics list | 5 min | Changes on create/delete |
| User preferences | 30 min | Rarely changes |
| Dictionary words | 1 hour | Read-only data |

---

## 7. Generic Shared Hooks (`shared/hooks/`)

Reusable hooks that abstract common async patterns. Use these instead of writing raw `useMutation` or URL boilerplate.

---

### `useToastMutation`

Wraps `useMutation` with `toast.promise` (loading / success / error feedback) without any custom invalidation logic. Use for any mutation where you want user feedback but don't need optimistic updates.

```typescript
import { useToastMutation } from '@/shared/hooks/use-toast-mutation';

export function useCreateTopic() {
  return useToastMutation({
    options: {
      mutationFn: (data: CreateTopicInput) => TopicApi.createTopic(data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: topicKeys.lists() }),
    },
    toast: {
      loading: 'Creating topic...',
      success: 'Topic created!',
      error: (err) => err.message,
    },
  });
}
```

- `mutateAsync` is replaced with a version that wraps the call in `toast.promise`.
- `toast` messages can be strings or functions receiving variables/error.
- For complex mutations (auth, navigation), use raw `useMutation` directly.

---

### `useOptimisticMutation`

Full optimistic update lifecycle: cancel refetches → snapshot → apply → rollback on error → invalidate on settled. Only shows an error toast (no loading/success toast — those contradict the instant UI update).

Four built-in strategies:

| Strategy | When to use |
|---|---|
| `updateInList` | Edit an item inside a cached array |
| `addToList` | Insert a new item (prepend or append) |
| `removeFromList` | Remove an item from a cached array |
| `custom` | Full control — provide your own updater |

```typescript
// Delete with removeFromList
useOptimisticMutation({
  options: { mutationFn: (id: string) => TopicApi.deleteTopic(id) },
  queryKey: topicKeys.lists(),
  updater: {
    type: 'removeFromList',
    getId: (item) => item.id,
    getIdFromVars: (id) => id,
  },
  errorToast: 'Delete failed — change reverted.',
});

// Edit with updateInList
useOptimisticMutation({
  options: { mutationFn: ({ id, name }) => TopicApi.updateTopic(id, { name }) },
  queryKey: topicKeys.lists(),
  updater: {
    type: 'updateInList',
    getId: (item) => item.id,
    getIdFromVars: (vars) => vars.id,
    merge: (old, vars) => ({ ...old, name: vars.name }),
  },
  errorToast: (err) => `Update failed: ${err.message}`,
});
```

---

### `usePaginationFromUrl`

Reads `page` and `pageSize` from URL search params (via `URLParamKeys`) and exposes a `setPagination` setter that updates the URL. URL is the single source of truth — shareable links, browser back/forward work automatically.

```typescript
const { page, pageSize, top, skip, setPagination } = usePaginationFromUrl();
// top = pageSize, skip = (page - 1) * pageSize — ready to pass to API
```

- Defaults: `page = 1`, `pageSize = 20`
- Invalid/missing params fall back to defaults via Zod `.catch()`

---

### `usePaginationQuery`

Combines `usePaginationFromUrl` + `useQuery` into one hook. Automatically extracts `count`, `hasMore`, and `paginationMeta` from the API envelope's `pagination` field.

```typescript
const {
  data, isLoading,
  page, pageSize, setPage, setPageSize,
  totalPages, count, hasMore, hasPrev,
} = usePaginationQuery({
  queryKey: (params) => topicKeys.list(params),
  queryFn: ({ top, skip }) => TopicApi.getTopics({ top, skip }),
});
```

- `setPageSize(n)` resets to page 1 to avoid empty result sets.
- `placeholderData` keeps previous page visible while loading next.

---

### `useUrlSearch`

Manages a single text search param in the URL with debounced writes. Input updates are instant (local state); URL writes are debounced by `delay` ms. Use `urlKeyword` for API calls, `keyword` for the input's `value` prop.

```typescript
const { keyword, updateKeyword, urlKeyword, clear } = useUrlSearch(
  '/_(authenticated)/dictionary/',
  { paramKey: 'q', delay: 300 },
);

// <input value={keyword} onChange={(e) => updateKeyword(e.target.value)} />
// API query: useQuery({ queryFn: () => search(urlKeyword) })
```

- `clear()` cancels the pending debounce and removes the param from URL immediately.
- Syncs `keyword` back when URL changes externally (browser back/forward).

---

## 8. Related Documentation

- [API Layer](./api-layer.md) — Request/response models, interceptors
- [Routing](./routing.md) — Route definitions and navigation
- [Overview](./overview.md) — Folder structure
