# Easy English V2 — Documentation

Comprehensive documentation for the Easy English V2 multi-tenant English learning platform.

---

## Documentation Map

```
docs/
├── architecture/          # System architecture and design decisions
│   ├── README.md
│   ├── architecture-overview.md
│   ├── system-design.md
│   ├── multi-tenant-design.md
│   ├── cqrs-guidelines.md
│   └── module-structure.md
│
├── domain/               # DDD domain model reference
│   ├── README.md
│   ├── auth/            # Authentication, sessions, JWT
│   ├── workspace/        # Multi-tenant workspaces
│   ├── flashcard/       # Card management, review logging
│   └── learning/         # Progress, study, topics
│
├── api/                  # REST API reference
│   ├── README.md
│   ├── authentication.md
│   ├── workspace.md
│   ├── flashcard.md
│   └── study.md
│
├── frontend/             # React client architecture
│   ├── README.md
│   ├── overview.md
│   ├── state-management.md
│   ├── routing.md
│   ├── api-layer.md
│   └── ui-components.md
│
├── features/             # Feature development templates
│   ├── README.md
│   ├── spec.md          # Feature specification template
│   ├── plan.md          # Implementation plan template
│   ├── tasks.md         # Task breakdown template
│   ├── research.md      # Research template
│   └── quickstart.md    # Feature onboarding template
│
├── adr/                  # Architecture decision records
│   ├── README.md
│   ├── 001-why-ddd.md
│   ├── 002-why-cqrs.md
│   ├── 003-why-multi-tenant.md
│   ├── 004-why-tanstack-query.md
│   └── 005-why-zustand.md
│
└── dev/                  # Developer workflow guides
    ├── README.md
    ├── setup.md
    ├── coding-standards.md
    ├── git-workflow.md
    ├── commit-guidelines.md
    └── folder-structure.md
```

---

## Quick Start

**New to the project?** Read in this order:

1. [Architecture Overview](./architecture/architecture-overview.md) — High-level system map
2. [Setup Guide](./dev/setup.md) — Get your local environment running
3. [Coding Standards](./dev/coding-standards.md) — Project conventions
4. [Folder Structure](./dev/folder-structure.md) — Where things live

**Adding a feature?** Start with the templates:

1. Copy [spec.md](./features/spec.md) → `docs/superpowers/specs/YYYY-MM-DD-feature-design.md`
2. Copy [plan.md](./features/plan.md) → `docs/superpowers/plans/YYYY-MM-DD-feature-implementation.md`
3. Copy [tasks.md](./features/tasks.md) → `tasks.md`

---

## Architecture

**Backend:** NestJS + TypeScript, CQRS + DDD, MikroORM + PostgreSQL
**Frontend:** React 19 + Rsbuild, TanStack Router + Query, Zustand, Tailwind CSS 4
**Multi-tenancy:** Workspace-scoped, shared database, application-level isolation

See [Architecture Overview](./architecture/architecture-overview.md) for the full system map.

---

## Key Decisions

| Decision | Record |
|----------|--------|
| Domain-Driven Design | [ADR-001](./adr/001-why-ddd.md) |
| CQRS separation | [ADR-002](./adr/002-why-cqrs.md) |
| Multi-tenant (shared DB) | [ADR-003](./adr/003-why-multi-tenant.md) |
| TanStack Query for server state | [ADR-004](./adr/004-why-tanstack-query.md) |
| Zustand for client state | [ADR-005](./adr/005-why-zustand.md) |

---

## Modules

| Module | Domain | Key Entities | Endpoints |
|--------|--------|-------------|---------|
| `auth` | Identity, sessions, JWT | `User`, `AuthIdentity`, `Session` | Register, Login, Refresh |
| `workspace` | Multi-tenancy | `WorkspaceEntity` | CRUD, List, Switch |
| `flashcard` | Card management | `ReviewLog` | CRUD, Review |
| `learning` | Progress & study | `UserWordSenseProgress`, `StudySession`, `Topic` | Due cards, Study, Topics |
