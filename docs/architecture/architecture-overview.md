# Architecture Overview

> High-level system architecture for **Easy English V2** — a multi-tenant English learning platform.

---

## 1. Overview

Easy English V2 is a full-stack, multi-tenant SaaS application designed for vocabulary learning and spaced repetition. It consists of three primary layers:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Client** | React 19 + Rsbuild | SPA frontend with TanStack Router/Query |
| **Server** | NestJS + TypeScript | REST API with CQRS + DDD |
| **Database** | PostgreSQL + MikroORM | Persistence layer |

---

## 2. System Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React)                       │
│  ┌─────────┐  ┌──────────┐  ┌───────┐  ┌───────────┐  │
│  │ Router  │  │ TanStack │  │Zustand│  │ Radix UI  │  │
│  │(TanStack│  │  Query   │  │Store  │  │+ Shadcn UI│  │
│  │ Router) │  │          │  │       │  │           │  │
│  └────┬────┘  └─────┬────┘  └───┬───┘  └─────┬─────┘  │
│       └──────────────┼───────────┼────────────┘         │
│                      │  HTTP/REST (JWT Bearer)          │
└──────────────────────┼──────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                   Server (NestJS)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Auth    │  │ Workspace │  │   Learning Module     │  │
│  │ (JWT +   │  │(Multi-    │  │  (Flashcard, Topic,  │  │
│  │ Sessions)│  │  tenant)  │  │   Study, Progress)   │  │
│  └────┬─────┘  └─────┬─────┘  └──────────┬───────────┘  │
│       │               │                    │              │
│  ┌────┴───────────────┴────────────────────┴─────────┐  │
│  │                    CQRS Bus                         │  │
│  │         Commands (Write)    Queries (Read)         │  │
│  └─────────────────────┬──────────────────────────────┘  │
│                        │                                 │
│  ┌─────────────────────┴──────────────────────────────┐  │
│  │              Domain Event Emitter                   │  │
│  │         (@nestjs/event-emitter)                     │  │
│  └─────────────────────┬──────────────────────────────┘  │
│                        │                                 │
│  ┌─────────────────────┴──────────────────────────────┐  │
│  │              MikroORM (PostgreSQL)                  │  │
│  │         ORM entities  +  Migrations                │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Backend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Runtime | Node.js | ≥ 24.x | Server runtime |
| Framework | NestJS | 11.x | API framework |
| Language | TypeScript | 5.x | Type safety |
| ORM | MikroORM | 6.x | Database access |
| Database | PostgreSQL | 15+ | Primary database |
| Auth | JWT + Passport | — | Authentication |
| CQRS | @nestjs/cqrs | 11.x | Command/query separation |
| Events | @nestjs/event-emitter | — | Domain events |
| Error Handling | neverthrow | — | Functional Result type |
| Validation | class-validator | — | DTO validation |
| Documentation | @nestjs/swagger | — | OpenAPI/Swagger |

### Frontend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | React | 19.x | UI framework |
| Bundler | Rsbuild | 1.x | Build tool |
| Language | TypeScript | 5.x | Type safety |
| Routing | TanStack Router | 1.x | Type-safe routing |
| Data Fetching | TanStack Query | 5.x | Server state |
| State | Zustand | 5.x | Client state |
| Forms | React Hook Form + Zod | — | Form handling |
| UI Primitives | Radix UI | — | Accessible components |
| UI Components | Shadcn UI | — | Design system |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Animations | Motion | — | Animations |
| i18n | i18next | — | Internationalization |

---

## 4. Module Architecture

The server is organized into **bounded contexts** (DDD modules). Each module contains its own commands, queries, entities, and domain logic.

```
server/src/modules/
├── auth/           # Authentication, sessions, JWT tokens
├── workspace/      # Multi-tenant workspace management
├── dictionary/     # Word/dictionary management (read-only data)
├── flashcard/      # User flashcards and review logs
└── learning/       # Learning progress, topics, and study sessions
    ├── progress/   # User word-sense learning progress (FSRS state)
    ├── topic/      # User-created word groups
    └── study/      # Study sessions, quiz cards, study statistics
```

### Module Dependencies (top-down only)

```
auth ──────► workspace
             │
             ▼
        learning ◄──── flashcard
             │
             ▼
         dictionary
```

Rules:
- `auth` has no dependencies on other modules
- `workspace` depends only on `auth`
- `learning` depends on `workspace` and `dictionary`
- `flashcard` depends on `learning/progress` (for scheduling via FSRS)
- `dictionary` is a leaf — no downstream dependencies

---

## 5. Data Flow

### Authentication Flow

```
┌──────┐     POST /api/v1/auth/login      ┌──────────┐    Validate     ┌──────────┐
│Client│ ─────────────────────────────────│   Auth   │────────────────│ Database │
│      │ ◄────────────────────────────────│  Module  │◄───────────────│(Postgres)│
└──────┘        JWT + Refresh Token        └──────────┘                 └──────────┘
       │
       │ JWT Bearer
       ▼
┌─────────────────────────────────────────────────────────────────┐
│  All subsequent requests include:                                │
│  Authorization: Bearer <jwt_token>                               │
│                                                                  │
│  NestJS Guard: JwtAuthGuard                                      │
│    └── WorkspaceContext: tenant isolation via workspaceId claim   │
└─────────────────────────────────────────────────────────────────┘
```

### Study Session Flow

```
Client starts study
        │
        ▼
POST /api/v1/study/sessions
        │
        ▼
StudyCommandHandler
        │
        ├─► Load due flashcards (MikroORM query)
        │
        ├─► Create Session entity
        │
        └─► Emit StudySessionStartedEvent
                │
                ▼
        DueCardsReturned (response to client)
```

### Review Card Flow

```
Client rates card (Again / Hard / Good / Easy)
        │
        ▼
POST /api/v1/study/reviews
        │
        ▼
ReviewCommandHandler
        │
        ├─► Load CardProgress entity
        │
        ├─► Apply FSRS algorithm (calculate next interval)
        │
        ├─► Update CardProgress (dueDate, stability, difficulty)
        │
        └─► Emit CardReviewedEvent
                │
                ├─► Update statistics
                └─► Schedule next review
```

---

## 6. Key Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Hexagonal Architecture** | Domain core is framework-agnostic. Infrastructure adapters implement application ports. Dependencies point inward. |
| **CQRS** | Commands mutate state; queries read state. Separate handler classes. |
| **DDD** | Each module has domain entities, value objects, repository ports, and mappers. |
| **Ports & Adapters** | Application layer defines interfaces (ports); infrastructure implements them (adapters). |
| **Multi-tenancy** | All queries scoped by `workspaceId` from JWT. Middleware enforces isolation. |
| **Event-driven** | Aggregate roots emit domain events via `addEvent()`. Repositories publish after save. |
| **Result pattern** | `Result<T, E>` from `neverthrow` for explicit error propagation. |
| **Type-safe API** | DTOs with `class-validator` decorators. Swagger auto-generated from DTOs. |

> Reference: [domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon) — the server architecture follows this pattern.

---

## 7. Project Structure

```
easy-english-v2/
├── server/                    # NestJS backend
│   ├── src/
│   │   ├── configs/           # Configuration schemas (env validation)
│   │   ├── core/              # Shared API infrastructure
│   │   │   └── api/           # DTOs, filters, API models
│   │   ├── migrations/        # Database migrations
│   │   ├── modules/           # DDD bounded contexts
│   │   │   └── <module>/
│   │   │       ├── application/    # Commands, queries, ports (interfaces)
│   │   │       ├── domain/         # Entities, value objects, events, exceptions
│   │   │       ├── infrastructure/ # Mappers, ORM entities, repo/service impls
│   │   │       ├── controllers/    # HTTP controllers
│   │   │       └── dto/            # Request/response DTOs
│   │   └── shared/            # Cross-cutting concerns
│   └── test/                  # Test utilities
│
├── client/                    # React frontend
│   ├── src/
│   │   ├── core/              # API client, routing, contexts
│   │   ├── features/          # Hotkeys feature
│   │   ├── modules/           # Feature modules (auth, learning, etc.)
│   │   ├── shared/            # Components, hooks, stores, UI
│   │   ├── locales/           # i18n translation files
│   │   └── styles/            # Global CSS
│   └── locales/              # Translation JSON files
│
├── design-system/             # Shared UI component library
├── docs/                      # This documentation
│   ├── architecture/
│   ├── domain/
│   ├── api/
│   ├── frontend/
│   ├── features/
│   ├── adr/
│   └── dev/
└── specs/                     # Feature specifications
```

---

## 8. Related Documentation

- [System Design](./system-design.md) — Infrastructure and deployment
- [Multi-Tenant Design](./multi-tenant-design.md) — Tenant isolation strategy
- [CQRS Guidelines](./cqrs-guidelines.md) — Command/query patterns
- [Module Structure](./module-structure.md) — DDD module conventions
