# Enterprise DDD Domain Documentation Upgrade

**Extracted:** 2026-04-28
**Context:** Upgrading a NestJS/DDD domain doc from basic to enterprise-ready

## Problem
A domain documentation file covers entities, VOs, events, and repositories but lacks:
- Explanation of *why* design decisions were made
- A concrete end-to-end flow showing how pieces connect
- Testing guidance for domain building blocks
- Consistency model clarity (strong vs eventual)
- An overly strict rule: "events only fire in `create()`"

## Solution

**Missing sections to add:**
1. **Design Decisions table** — `Decision | Alternatives | Why This Approach`
2. **Example Flow section** — step-by-step trace of one write operation (e.g. registration), showing every domain object involved and who calls what
3. **Domain Testing Guidelines** — test scope table per layer; concrete test examples for VOs, AggregateRoots (`create()` emits events, `rehydrate()` does not), and domain services; rules on what NOT to test in domain unit tests
4. **Consistency column in Domain Events table** — `Strong` (same transaction) vs `Eventual` (event listener, separate tx)

**Rule fix:**
- Change "events must fire in `create()` only" → "events fire in `create()` or any state-mutating method — NEVER in `rehydrate()`"
- The old rule is wrong: `User.activate()`, `User.deactivate()` are legitimate event-emitting methods

**Template additions:**
- Add `Context Dependencies` section to every module README
- Add `Design Decisions` section to every module README
- Add `Consistency` column to Domain Events table

**Anti-patterns to add:**
- Oversized aggregate (5+ child entities)
- Domain service that calls a repository (I/O belongs in application layer)
- Missing Design Decisions on non-obvious boundaries

## Example

Full upgraded structure for `docs/domain/<module>/README.md`:
```
# <Module> Domain
## Ubiquitous Language
## Context Dependencies       ← new
## Aggregates
## Entities
## Value Objects
## Domain Rules
## Domain Events              ← add Consistency column
## Domain Services
## Repository Interfaces
## Use Cases (Commands)
## Use Cases (Queries)
## Design Decisions           ← new
```

End-to-end Example Flow format:
```
Client
  │  POST /auth/register { email, password, name }
  ▼
Controller → dispatches Command
  ▼
Handler (Application Layer)
  │  1. port.findByEmail()     — enforces [UniqueEmail] rule
  │  2. DomainService.derive() — produces VO
  │  3. Aggregate.create()     — emits DomainEvent
  │  4. repository.persist()
  │  5. unitOfWork.commit()    — strong consistency boundary ends here
  │  6. publishEvents()
  ▼
EventHandler (separate transaction) — eventual consistency
```

Domain test examples:
```typescript
// VO: test valid + invalid + edge cases
expect(() => Email.create('bad')).toThrow(ArgumentInvalidException);

// Aggregate: create() emits, rehydrate() does not
expect(User.create(...).domainEvents).toHaveLength(1);
expect(User.rehydrate(...).domainEvents).toHaveLength(0);

// Domain service: pure computation, instantiate directly (no DI)
const result = new UsernameGeneratorService().generate('John Doe');
expect(result).toBeInstanceOf(Username);
```

## When to Use
- User asks to "upgrade", "make enterprise-ready", or "improve" an existing DDD domain doc
- Reviewing a domain README that is missing testing guidance or design rationale
- Team adopts DDD and wants a documentation standard for NestJS projects
