# ADR-001: Why Domain-Driven Design

> Architecture Decision Record — Choosing DDD as the primary backend organization pattern.

## Status

**Accepted**

---

## Context

Easy English V2 is a vocabulary learning platform with evolving domain complexity. The initial version started as a simple CRUD application, but the requirements include:

- Spaced repetition scheduling (FSRS algorithm)
- Multi-tenant workspaces with user-specific learning progress
- Word sense management from an external dictionary
- Study sessions with configurable scopes (due cards, topic-specific)
- Event-driven statistics and mastery tracking

These features involve rich domain logic that doesn't fit neatly into a controller-service-repository pattern. The question is: **how should we organize the backend code to handle this complexity?**

---

## Decision

We adopted **Domain-Driven Design (DDD)** as the primary organizational pattern for the backend, using the following practices:

- **Bounded contexts** mapped to NestJS modules
- **Domain entities** with encapsulated behavior (not anemic data bags)
- **Value objects** for constrained types (e.g., `FsrsParameters`, `CardRating`)
- **Domain events** emitted from aggregate roots
- **Repository interfaces** in the domain layer, implemented in infrastructure
- **Application services** via CQRS commands and queries

---

## Options Considered

| Approach | Pros | Cons |
|----------|------|------|
| **DDD (chosen)** | Rich domain model, clear boundaries, testable logic | Steeper learning curve, more code upfront |
| Transaction Script | Fast to implement, simple | Logic gets duplicated, hard to evolve |
| Active Record | Built into MikroORM, simple | Leads to anemic entities, no encapsulation |
| Pure ORM Entities | TypeORM-like pattern | No distinction between domain and persistence |

---

## Consequences

### Positive

- **Encapsulated business rules** — The `FsrsParameters.applyReview()` method knows how to update state. No service scattered across files.
- **Clear boundaries** — The `learning` module depends on `dictionary` but not vice versa. Dependencies are explicit.
- **Testable domain logic** — Entities are plain TypeScript classes. No NestJS, no database needed for unit tests.
- **Event-driven side effects** — `WordReviewedEvent` triggers stats updates without coupling the review handler to the stats module.
- **Evolves with the domain** — Adding new card types, study modes, or learning algorithms maps naturally to new domain entities.

### Negative

- **Initial complexity** — Developers new to DDD need to understand entities, value objects, and aggregates.
- **More files** — The same functionality is spread across more files than a Transaction Script approach.
- **Mapping overhead** — Domain entities must be mapped to ORM entities and back.

---

## Implementation Notes

The DDD structure is **not** a full Evans-style DDD with aggregates, repositories, and domain services in every module. It is a **pragmatic DDD** — we use the patterns where they add value:

- Entities for objects with identity (User, StudySession, Flashcard)
- Value objects for constrained types (CardRating, FsrsParameters, Email)
- Aggregate roots for entities that emit events (UserWordSenseProgress, StudySession)
- Plain domain methods for behavior that doesn't cross aggregate boundaries

We deliberately **do not** use:
- Domain services (logic fits in entities)
- Application services (handled by CQRS handlers)
- Mappers in a separate layer (handled inline in repositories)

---

## Related Decisions

- [ADR-002: Why CQRS](./002-why-cqrs.md) — Command/query separation rationale
- [ADR-003: Why Multi-tenant](./003-why-multi-tenant.md) — Tenant isolation rationale
