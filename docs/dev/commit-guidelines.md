# Commit Guidelines

> Commit message format and conventions for Easy English V2.

---

## 1. Format

Every commit message follows the **Conventional Commits** specification:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

---

## 2. Type Reference

| Type | When to Use |
|------|------------|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build, config, dependencies, tooling |
| `perf` | Performance improvement |
| `ci` | CI/CD configuration |

---

## 3. Scope Reference

The scope is the affected module or area:

| Scope | Affected Code |
|-------|-------------|
| `auth` | Authentication, sessions, JWT |
| `workspace` | Workspace management, tenant context |
| `flashcard` | Flashcard CRUD, card review |
| `learning` | Learning progress, study sessions |
| `topic` | Topic management |
| `dictionary` | Word dictionary, lookup |
| `api` | API client, HTTP interceptors |
| `ui` | UI components, design system |
| `infra` | Infrastructure, database, migrations |

---

## 4. Examples

### Feature

```
feat(flashcard): add due card retrieval endpoint

Implements GET /api/v1/learning/study/due which returns cards
scheduled for review today based on FSRS dueDate calculation.

Closes EE2-123
```

### Bug Fix

```
fix(learning): prevent session start when no cards due

Previously StartStudySessionHandler would create an empty session
when no cards were due. Now it returns a DomainError to prevent
empty sessions from being created.

Closes EE2-456
```

### Refactor

```
refactor(workspace): extract CreateWorkspaceDto validator

Moved IsPasswordStrong to a shared validators directory and
updated imports across auth and workspace modules.

Closes EE2-789
```

### Documentation

```
docs(api): add workspace endpoints documentation

Adds request/response schemas for GET/POST /api/v1/workspaces
and the check endpoint. Includes example payloads.

Closes EE2-101
```

### Chore

```
chore(deps): upgrade TanStack Query to v5.45

Updated @tanstack/react-query from 5.28 to 5.45.
No breaking changes detected in our usage.

Closes EE2-102
```

---

## 5. Rules

1. **Summary line** ≤ 72 characters
2. **Summary starts with lowercase** after the scope
3. **No emoji** in commit messages
4. **Reference tickets** in footer: `Closes EE2-123`
5. **One logical change per commit** — don't mix concerns
6. **Squash commits** before merging PRs (clean history on main)

---

## 6. Bad Examples

```
fix stuff              ← No type, no scope
Fixed the bug         ← No type, no scope
WIP                   ← Work in progress (use draft PR instead)
added feature         ← Summary starts with lowercase, no scope
feat: add button     ← Missing scope
```
