# ADR-002: Why CQRS

> Architecture Decision Record — Command Query Responsibility Separation.

## Status

**Accepted**

---

## Context

The application has two fundamentally different operations:

1. **Writes** — User submits a card review. The system must:
   - Load the current card progress
   - Validate the rating
   - Calculate the next FSRS interval
   - Persist the new state
   - Emit a `WordReviewedEvent`
   - Record a `ReviewLog`

2. **Reads** — Client requests due cards. The system must:
   - Query due cards with tenant filter
   - Join with flashcard data
   - Map to a `DueCardView` DTO
   - Return only the fields the UI needs

These operations have different optimization needs, different consistency requirements, and different caching profiles. Mixing them leads to either:
- Read models polluted with write concerns (transactions, validation, events)
- Write paths bloated with read-optimization (joins, projections)

---

## Decision

We adopted **CQRS** (Command Query Responsibility Separation) using `@nestjs/cqrs`:

- Every write operation is a **Command** — `CreateFlashcardCommand`, `ReviewCardCommand`
- Every read operation is a **Query** — `GetDueCardsQuery`, `GetTopicDetailQuery`
- Commands return `Result<T, E>` from `neverthrow`
- Queries return `Result<T[], E>` or `Result<T, E>`
- Commands emit **domain events** for async side effects

```
Controller
  │
  ├─► commandBus.execute(CreateFlashcardCommand)
  │      │
  │      └─► CreateFlashcardHandler
  │              │
  │              ├─► Validate input
  │              ├─► Create entity
  │              ├─► Persist
  │              └─► Emit FlashcardCreatedEvent
  │
  └─► queryBus.execute(GetDueCardsQuery)
         │
         └─► GetDueCardsHandler
                 │
                 ├─► Check cache
                 ├─► Query DB
                 └─► Map to DueCardView
```

---

## Consequences

### Positive

- **Separation of concerns** — Command handlers don't worry about DTOs or caching. Query handlers don't worry about validation or events.
- **Independent optimization** — Read queries can be cached, write commands bypass the cache. No trade-offs.
- **Clear error handling** — `Result<T, E>` forces callers to handle errors explicitly. No hidden exceptions.
- **Natural testability** — Commands are easy to unit test in isolation. Query handlers can be integration-tested against a test database.
- **Event sourcing readiness** — Domain events are first-class. A complete audit trail is possible in the future.

### Negative

- **More boilerplate** — One file per command, one file per handler. A simple CRUD operation becomes 4 files.
- **Mental overhead** — Deciding whether something is a command or query requires judgment.
- **Handler discovery** — When reading a controller, you need to look up the handler implementation.

---

## Alternatives Considered

| Approach | Why Not Chosen |
|---------|----------------|
| Single service methods with return values | Commands and queries get mixed; event emission leaks to services |
| Event sourcing for everything | Overkill for a learning platform; complexity not justified |
| Repository pattern only | Doesn't address the command/query optimization gap |

---

## Implementation Notes

- Commands are **not** transactional by default. Use `@Transactional()` decorator if needed.
- Domain events are emitted **after** the entity is persisted to ensure consistency.
- Query handlers **never emit events** and **never modify state**.
- All handlers return `Result<T, E>` — never `throw`. Controllers catch `Result` failures and convert to HTTP errors.
- The `neverthrow` library is used for `Result<T, E>` typing.

---

## Related Decisions

- [ADR-001: Why DDD](./001-why-ddd.md) — CQRS builds on the DDD foundation
- [ADR-004: Why TanStack Query](./004-why-tanstack-query.md) — CQRS patterns extend to the client
