# Feature Templates

Templates for the feature development lifecycle.

## Templates

| Template | Purpose | When to Use |
|----------|---------|-------------|
| [spec.md](./spec.md) | Feature specification | Before writing any code |
| [plan.md](./plan.md) | Implementation plan | After spec is approved |
| [tasks.md](./tasks.md) | Task breakdown | After plan is approved |
| [research.md](./research.md) | Technical research | When exploring options |
| [quickstart.md](./quickstart.md) | Feature onboarding | After feature is built |

## Lifecycle

```
research.md (optional)
  ↓
spec.md ← Design approval
  ↓
plan.md ← Implementation plan approval
  ↓
tasks.md ← Task breakdown
  ↓
Implementation
  ↓
quickstart.md ← Post-implementation documentation
```

## Template Conventions

### Naming

```
YYYY-MM-DD-<feature-name>-<template>.md
```

Example: `2026-04-05-quiz-mode-spec.md`

### Storage

- `spec.md` → `docs/superpowers/specs/`
- `plan.md` → `docs/superpowers/plans/`
- `tasks.md` → project root or `docs/superpowers/`
- `research.md` → `docs/superpowers/research/`
- `quickstart.md` → `docs/features/<feature-name>/`
