# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

---

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

---

## Technical Context

| Attribute | Value |
|-----------|-------|
| **Frontend** | React 18, TanStack Router, TanStack Query, Zustand, Shadcn UI |
| **Backend** | NestJS, CQRS (`@nestjs/cqrs`), MikroORM |
| **Database** | PostgreSQL |
| **Testing** | Jest (backend), Vitest / React Testing Library (frontend) |
| **API Style** | REST, versioned (`/api/v1/...`), OpenAPI/Swagger documented |

---

## Constitution Compliance Checklist

> **GATE**: Must pass before Phase 0 research. Re-verify after Phase 1 design.

### Multi-Tenancy (§3)
- [x] All data access is scoped by tenant ID
- [x] Cross-tenant access is forbidden
- [x] Tenant context is propagated through all layers

### Security (§4)
- [x] Authentication/Authorization is tenant-aware
- [x] Sensitive data is encrypted at rest and in transit
- [x] Least-privilege access is applied

### CQRS Rules (§5)
- [x] Commands mutate state only; return acknowledgment or ID only
- [x] Queries are read-only; no side effects
- [x] No mixing of Command and Query in a single handler

### API Design (§9)
- [x] API is versioned (`/api/v1/...`)
- [x] DTOs are used; domain models are not exposed
- [x] Rate limiting is enforced on public endpoints
- [x] Responses conform to the standard schema defined in response-schema.md
- [x] Endpoints adhere to the API contract specification

### Frontend State (§12)
- [x] Server state uses TanStack Query only
- [x] Client/UI state uses Zustand only
- [x] No backend business rules duplicated on frontend

### Observability (§8)
- [x] Structured logging with tenant ID, user ID, correlation ID
- [x] Errors are traceable via correlation IDs

### Design for Extensibility & Maintainability (§18)
- [x] Favors design patterns promoting loose coupling (Strategy, Observer, etc.)
- [x] Avoids tight coupling between components

---

## Project Structure

### Specification Artifacts (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Backend: `server/src/modules/<feature>/`

```text
server/src/modules/[feature]/
├── [feature].module.ts                 # NestJS module definition
├── controllers/
│   └── [feature].controller.ts         # HTTP endpoints (no business logic)
├── application/
│   ├── commands/
│   │   ├── [action].command.ts         # Command definition
│   │   └── [action].handler.ts         # Command handler (state mutation)
│   └── queries/
│       ├── [query].query.ts            # Query definition
│       └── [query].handler.ts          # Query handler (read-only)
├── domain/
│   ├── entities/                       # Domain entities / aggregates
│   ├── value-objects/                  # Value objects
│   ├── events/                         # Domain events (if applicable)
│   └── repositories/                   # Repository interfaces
├── infrastructure/
│   ├── persistence/                    # Entity implementations, MikroORM entities
│   └── repositories/                   # Repository implementations
└── dto/
    ├── requests/                       # Request DTOs
    └── responses/                      # Response DTOs
```

**Backend Constraints**:
- Business logic MUST reside in domain entities, services, or command/query handlers
- Controllers are thin: validate input, delegate to handlers, return DTOs
- Commands MUST NOT return data (except IDs or acknowledgments)
- Queries MUST NOT cause state changes
- All data access MUST be tenant-scoped

### Backend: `server/src/core/` (System Infrastructure)

```text
server/src/core/
├── background/          # Background jobs, schedulers
├── configs/             # App configurations
├── database/            # Database setup, migrations, base entities
├── decorators/          # Custom decorators (system-level)
├── domain/              # Base domain classes (AggregateRoot, Entity, ValueObject)
├── infrastructure/      # Base infrastructure (BaseRepository, etc.)
├── interceptors/        # Global interceptors
├── request/             # Request handling (context, correlation)
└── tests/               # Test utilities
```

> **CORE CONSTRAINTS**:
> - Contains ONLY system-level infrastructure
> - NO domain logic, NO feature-specific behavior
> - MUST be dependency-free from `modules/`
> - If code has domain ownership → it belongs in a feature module

### Backend: `server/src/shared/` (Stateless Utilities)

```text
server/src/shared/
├── constants/           # App constants
├── decorators/          # Shared decorators
├── domain/              # Shared domain models (cross-cutting)
├── errors/              # Error definitions
├── filters/             # Exception filters
├── interceptors/        # Shared interceptors
├── middlewares/         # HTTP middlewares
├── models/              # Shared models/DTOs
├── services/            # Shared services (stateless)
├── tests/               # Shared test utilities
└── utils/               # Utility functions
```

> **SHARED CONSTRAINTS**:
> - Contains ONLY stateless, behavior-agnostic utilities
> - NO business rules, NO lifecycle, NO ownership
> - MUST NOT become a "dumping ground"
> - If code has clear domain ownership → it belongs in a feature module

### Frontend: `client/src/modules/<feature>/`

```text
client/src/modules/[feature]/
├── index.ts                            # Public module exports
├── components/
│   ├── [component].tsx                 # UI components (Shadcn UI based)
│   └── [component].stories.tsx         # Storybook stories (optional)
├── pages/
│   └── [page].tsx                      # Route page components
├── hooks/
│   ├── use-[query].ts                  # TanStack Query hooks (server state)
│   └── use-[action].ts                 # Mutation hooks
├── services/
│   └── [feature].api.ts                # API service layer (fetch/axios)
├── stores/
│   └── use-[feature]-store.ts          # Zustand store (UI state ONLY)
├── types/
│   └── [feature].types.ts              # TypeScript types/interfaces
└── utils/
    └── [feature].utils.ts              # Feature-specific utilities
```

**Frontend Constraints**:
- API access MUST go through `services/` layer
- TanStack Query for ALL server state (fetching, caching, sync)
- Zustand for UI state ONLY (modals, filters, selections)
- NO backend business rules duplicated on frontend
- Components extend Shadcn UI primitives

### Frontend: `client/src/shared/` (Shared Utilities)

```text
client/src/shared/
├── api/                 # API client setup (axios instance, interceptors)
├── constants/           # App constants
├── contexts/            # React contexts (global providers)
├── hooks/               # Shared custom hooks
├── lib/                 # Third-party library configs
├── types/               # Shared TypeScript types
├── ui/                  # UI components
│   ├── common/          # Custom reusable components
│   └── shadcn/          # shadcn/ui components
└── utils/               # Utility functions
```

> **FRONTEND SHARED CONSTRAINTS**:
> - Contains ONLY stateless, reusable utilities
> - NO feature-specific business logic
> - If code has clear feature ownership → it belongs in `modules/<feature>/`

---

## Backend Design

### Commands (State Mutations)

| Command | Handler | Description |
|---------|---------|-------------|
| `CreateTopicCommand` | `CreateTopicHandler` | Creates a new topic (verifies max 50 topics/user) |
| `UpdateTopicCommand` | `UpdateTopicHandler` | Updates an existing topic's name and description |
| `DeleteTopicCommand` | `DeleteTopicHandler` | Deletes a topic and cascades TopicWord deletions |
| `AddTopicWordCommand` | `AddTopicWordHandler` | Adds a word sense to a topic (verifies max 200 words, duplicates) |
| `RemoveTopicWordCommand` | `RemoveTopicWordHandler` | Removes a word sense from a topic |

### Queries (Read Operations)

| Query | Handler | Description |
|-------|---------|-------------|
| `ListTopicsQuery` | `ListTopicsHandler` | Returns paginated list of user's topics |
| `GetTopicDetailQuery` | `GetTopicDetailHandler` | Returns topic metadata (name, description) |
| `ListTopicWordsQuery` | `ListTopicWordsHandler` | Returns paginated list of words in a topic |

### API Endpoints

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| `POST` | `/api/v1/topics` | `TopicController` | CreateTopicCommand |
| `GET` | `/api/v1/topics` | `TopicController` | ListTopicsQuery |
| `GET` | `/api/v1/topics/:id` | `TopicController` | GetTopicDetailQuery |
| `PUT` | `/api/v1/topics/:id` | `TopicController` | UpdateTopicCommand |
| `DELETE` | `/api/v1/topics/:id` | `TopicController` | DeleteTopicCommand |
| `GET` | `/api/v1/topics/:id/words` | `TopicController` | ListTopicWordsQuery |
| `POST` | `/api/v1/topics/:id/words` | `TopicController` | AddTopicWordCommand |
| `DELETE` | `/api/v1/topics/:topicId/words/:wordSenseId` | `TopicController` | RemoveTopicWordCommand |

---

## Frontend Design

### Pages & Routes

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/learning/topics` | `TopicsPage` | View all topics and create new ones |
| `/learning/topics/:id` | `TopicDetailPage` | View topic metadata and paginated word list |

### State Management

| Store/Hook | Type | Purpose |
|------------|------|---------|
| `useTopicsQuery` | TanStack Query | Query paginated list of topics |
| `useTopicDetailQuery` | TanStack Query | Query topic metadata |
| `useTopicWordsQuery` | TanStack Query | Query paginated list of topic words |
| `useCreateTopicMutation` | TanStack Query | Mutation to create topic |
| `useUpdateTopicMutation` | TanStack Query | Mutation to update topic |
| `useDeleteTopicMutation` | TanStack Query | Mutation to delete topic |
| `useAddTopicWordMutation`| TanStack Query | Mutation to add word to topic |
| `useRemoveTopicWordMutation`| TanStack Query | Mutation to remove word from topic |
| `useTopicsStore` | Zustand | UI state: Topic creation/edit modals |

### Components

| Component | Shadcn Base | Purpose |
|-----------|-------------|---------|
| `CreateTopicDialog` | `Dialog` | Modal form to create a new topic |
| `UpdateTopicDialog` | `Dialog` | Modal form to edit an existing topic |
| `TopicList` | `Card`, `List` | Displays the paginated user topics |
| `TopicWordList` | `Table` | Displays the paginated words within a topic |

---

## Testing Strategy

### Backend Tests

| Type | Location | Scope |
|------|----------|-------|
| Unit | `server/src/modules/[feature]/**/*.spec.ts` | Domain logic, handlers |
| Integration | `server/test/[feature]/` | API endpoints, CQRS flow |

### Frontend Tests

| Type | Location | Scope |
|------|----------|-------|
| Unit | `client/src/modules/[feature]/**/*.test.ts` | Components, hooks, utils |
| E2E | `client/e2e/[feature]/` | Critical user flows |

---

## Verification Plan

### Automated Verification
- [ ] All unit tests pass (`npm run test`)
- [ ] All integration tests pass
- [ ] Lint and type checks pass
- [ ] API contracts match OpenAPI spec

### Manual Verification
- [ ] Create a topic and verify it appears in the list.
- [ ] Update topic and see changes immediately.
- [ ] Add a word to a topic.
- [ ] View the topic details and observe the paginated words API call.
- [ ] Attempt to add more than 200 words (mocked limit) to test constraints.
- [ ] Delete topic and verify words are gone.

---

## Core/Shared Usage Justification

> **REQUIRED**: If this feature adds or modifies code in `core/` or `shared/`, document justification below.
> If no core/shared usage, write "N/A - All code resides in feature module."

### Backend Core/Shared

N/A - All code resides in feature module (`modules/learning`).

### Frontend Shared

N/A - All feature-specific code resides in `client/src/modules/learning`.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., Command returns data] | [Specific need] | [Why acknowledgment insufficient] |

---

## Open Questions

- [ ] [Any unresolved questions for this feature]
