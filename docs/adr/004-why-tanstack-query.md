# ADR-004: Why TanStack Query

> Architecture Decision Record — Server state management for the React client.

## Status

**Accepted**

---

## Context

The React client needs to:
- Fetch due cards from the API
- Display study statistics
- Show topic word lists
- Keep all of this data synchronized with the server

We considered several approaches for managing this **server state** (as opposed to client UI state like modal open/closed).

---

## Decision

We adopted **TanStack Query (React Query) v5** as the primary server state management solution:

- All API data fetching goes through TanStack Query hooks
- Query keys are used as cache identifiers
- Stale time, cache time, and retry logic are configured per-query
- Mutations invalidate related queries automatically

---

## Consequences

### Positive

- **Automatic caching** — Query results are cached. Navigating back to a page doesn't refetch if data is fresh.
- **Background refetch** — Data is refreshed in the background when the window regains focus.
- **Loading/error states** — Built into the `useQuery` return value.
- **Pagination support** — `useInfiniteQuery` for cursor-based pagination.
- **Optimistic updates** — Mutations can update the cache immediately for instant feedback.
- **No prop drilling** — Data is accessed via hooks, not passed through components.
- **TypeScript support** — Full type inference for query keys, data, and errors.

### Negative

- **Learning curve** — `useEffect` + `useState` is simpler for small apps.
- **Debug complexity** — The DevTools browser extension is required to debug cache issues.
- **Query key management** — Keys must be consistent between definition and invalidation sites.

---

## Alternatives Considered

| Approach | Why Not Chosen |
|---------|----------------|
| **TanStack Query (chosen)** | Best balance of caching, DX, and TypeScript support |
| SWR | TanStack Query has better TypeScript inference and more flexible invalidation |
| RTK Query | Steeper learning curve, more opinionated; Zustand is already in use |
| `useEffect` + `useState` | No caching, manual loading/error state, prop drilling |
| Apollo Client | Overkill for REST API; adds GraphQL dependency |

---

## Implementation Notes

### Query Key Strategy

```typescript
// Hierarchical keys — invalidating parent invalidates all children
const queryKeys = {
  all: ['due-cards'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: DueCardsFilters) => [...queryKeys.lists(), filters] as const,
};
```

Invalidation:
```typescript
// Invalidate all due card queries
queryClient.invalidateQueries({ queryKey: queryKeys.all });

// Invalidate specific filter
queryClient.invalidateQueries({
  queryKey: queryKeys.list({ topicId: '123' }),
});
```

### Stale Time by Data Type

| Data Type | Stale Time | Reasoning |
|-----------|-----------|-----------|
| Due cards | 1 min | Changes after each review |
| Flashcards list | 5 min | Stable unless user edits |
| Topics | 5 min | Changes on create/delete |
| Study stats | 2 min | Updates after sessions |
| User preferences | 30 min | Rarely changes |

### Integration with Zustand

- **Zustand** for client state: auth token, wizard step, modal visibility
- **TanStack Query** for server state: cards, topics, stats

They do NOT overlap. If data comes from the API, it goes through TanStack Query.

---

## Related Decisions

- [ADR-005: Why Zustand](./005-why-zustand.md) — Client state rationale
