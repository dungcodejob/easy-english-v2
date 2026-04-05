# Architecture Decision Records

Documenting significant architectural decisions with context, options considered, and consequences.

## Contents

| ID | Title | Status |
|----|-------|--------|
| [ADR-001](./001-why-ddd.md) | Why Domain-Driven Design | Accepted |
| [ADR-002](./002-why-cqrs.md) | Why CQRS | Accepted |
| [ADR-003](./003-why-multi-tenant.md) | Why Multi-tenant (Shared Database) | Accepted |
| [ADR-004](./004-why-tanstack-query.md) | Why TanStack Query | Accepted |
| [ADR-005](./005-why-zustand.md) | Why Zustand | Accepted |

## ADR Format

Each ADR follows the standard format:

```
Title: <concise decision statement>
Status: Proposed | Accepted | Deprecated | Superseded by ADR-NNN
Context: The situation that prompted this decision
Decision: What was decided
Consequences: Positive and negative effects
Alternatives Considered: Other options and why they weren't chosen
```

## Adding New ADRs

Create a new file: `docs/adr/NNN-title.md`

When adding a new ADR:
1. Assign the next sequential number
2. Set status to `Proposed`
3. After team review, update status to `Accepted`
4. If superseded, link to the replacement ADR
