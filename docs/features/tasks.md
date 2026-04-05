# Task List Template

> Template for feature tasks. Copy to `tasks.md`.

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature** | `<Feature Name>` |
| **Spec** | `<Link to spec>` |
| **Plan** | `<Link to plan>` |

---

## Task Groups

### Group 1: _Group Name_

Tasks with shared context or that must be completed together.

#### Tasks

| # | Task | Type | Estimate | Dependencies |
|---|------|------|----------|-------------|
| 1 | **Task description** | `server` / `client` / `both` | _h | — |
| 2 | **Another task** | `server` | _h | #1 |

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Notes:**
_Any additional context for this group._

---

### Group 2: _Group Name_

#### Tasks

| # | Task | Type | Estimate | Dependencies |
|---|------|------|----------|-------------|
| 3 | **Task description** | `client` | _h | #2 |

**Acceptance Criteria:**
- [ ] Criterion 1

---

## Summary

| Group | Tasks | Estimate |
|-------|-------|----------|
| Group 1 | 2 | _h |
| Group 2 | 1 | _h |
| **Total** | **3** | **_h** |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] No TypeScript errors
- [ ] Lint and format pass
- [ ] Spec acceptance criteria verified
- [ ] PR reviewed and merged

---

## Notes

_Any cross-cutting concerns, tips, or context:_

- Use `@tanstack/react-query` for all server state
- Repository interfaces live in domain layer
- ORM entities are separate from domain entities
