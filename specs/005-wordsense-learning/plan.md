# Implementation Plan: WordSense Learning

**Branch**: `005-wordsense-learning` | **Date**: 2026-03-06 | **Spec**: [spec.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/005-wordsense-learning/spec.md)  
**Input**: Feature specification from `/specs/005-wordsense-learning/spec.md`

---

## Summary

Enable users to search dictionary WordSenses, view details, and manage a personal learning list. Dictionary search/view is public; learning actions require auth. The Learning module is a new bounded context with `UserWordSenseProgress` entity, CQRS handlers, and REST API. Search uses ILIKE prefix matching on existing `words` table. Soft-delete for removal with progress restoration on re-add.

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
- [x] All data access is scoped by tenant ID — N/A: Dictionary is global, Learning is user-scoped (per spec assumption). No tenant column needed for this feature.
- [x] Cross-tenant access is forbidden — N/A: No tenant concept in this feature.
- [x] Tenant context is propagated through all layers — N/A for this feature.

### Security (§4)
- [x] Authentication/Authorization is tenant-aware — Search/View are public (per clarification). Add/Remove require JwtAuthGuard.
- [x] Sensitive data is encrypted at rest and in transit — No new sensitive data introduced.
- [x] Least-privilege access is applied — Users can only access their own progress records.

### CQRS Rules (§5)
- [x] Commands mutate state only; return acknowledgment or ID only — AddToLearning returns `{ id }`, RemoveFromLearning returns `null`.
- [x] Queries are read-only; no side effects — SearchWordSenses, GetWordSenseDetail, GetLearningList are read-only.
- [x] No mixing of Command and Query in a single handler — Strictly separated.

### API Design (§9)
- [x] API is versioned (`/api/v1/...`) — All endpoints under `/api/v1/`.
- [x] DTOs are used; domain models are not exposed — Request/Response DTOs for all endpoints.
- [x] Rate limiting is enforced on public endpoints — Search endpoint needs rate limiting.
- [x] Responses conform to the standard schema defined in response-schema.md — Envelope structure used.
- [x] Endpoints adhere to the API contract specification — Documented in contracts/api-contracts.md.

### Frontend State (§12)
- [x] Server state uses TanStack Query only — All API data via TanStack Query hooks.
- [x] Client/UI state uses Zustand only — Search input, filters in Zustand store.
- [x] No backend business rules duplicated on frontend — Frontend delegates to backend.

### Observability (§8)
- [x] Structured logging with tenant ID, user ID, correlation ID — Via existing NestJS interceptors.
- [x] Errors are traceable via correlation IDs — Via existing error handling infrastructure.

### Design for Extensibility & Maintainability (§18)
- [x] Favors design patterns promoting loose coupling (Strategy, Observer, etc.) — Separate bounded context, CQRS pattern.
- [x] Avoids tight coupling between components — Learning references Dictionary via ID only.

---

## Project Structure

### Specification Artifacts (this feature)

```text
specs/005-wordsense-learning/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   └── api-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Backend: `server/src/modules/learning/`

```text
server/src/modules/learning/
├── learning.module.ts
├── controllers/
│   └── learning.controller.ts        # Add/Remove/List endpoints
├── application/
│   ├── commands/
│   │   ├── add-to-learning.command.ts
│   │   ├── add-to-learning.handler.ts
│   │   ├── remove-from-learning.command.ts
│   │   └── remove-from-learning.handler.ts
│   └── queries/
│       ├── get-learning-list.query.ts
│       └── get-learning-list.handler.ts
├── domain/
│   ├── entities/
│   │   └── user-word-sense-progress.entity.ts
│   └── repositories/
│       └── learning.repository.interface.ts
├── infrastructure/
│   ├── persistence/
│   │   └── user-word-sense-progress.orm-entity.ts
│   └── repositories/
│       └── learning.repository.ts
└── dto/
    ├── requests/
    │   └── add-to-learning.request.dto.ts
    └── responses/
        └── learning-list-item.response.dto.ts
```

### Backend: Dictionary module additions

```text
server/src/modules/dictionary/
├── controllers/
│   └── dictionary.controller.ts     # NEW: search + sense detail endpoints
├── application/queries/
│   ├── search-word-senses.query.ts  # NEW
│   ├── search-word-senses.handler.ts # NEW
│   ├── get-word-sense-detail.query.ts # NEW
│   └── get-word-sense-detail.handler.ts # NEW
├── domain/repositories/
│   └── word-read.repository.interface.ts # UPDATED: add search + getSenseById
└── dto/responses/
    ├── word-sense-search-result.response.dto.ts # NEW
    └── word-sense-detail.response.dto.ts # NEW
```

### Frontend: `client/src/modules/learning/`

```text
client/src/modules/learning/
├── index.ts
├── components/
│   ├── search-input.tsx
│   ├── search-results-list.tsx
│   ├── word-sense-card.tsx
│   ├── word-sense-detail.tsx
│   ├── learning-list.tsx
│   └── add-to-learning-button.tsx
├── pages/
│   ├── dictionary-search.page.tsx
│   ├── word-sense-detail.page.tsx
│   └── my-learning.page.tsx
├── hooks/
│   ├── use-search-word-senses.ts
│   ├── use-word-sense-detail.ts
│   ├── use-learning-list.ts
│   ├── use-add-to-learning.ts
│   └── use-remove-from-learning.ts
├── services/
│   ├── dictionary.api.ts
│   └── learning.api.ts
├── stores/
│   └── use-search-store.ts
└── types/
    └── learning.types.ts
```

---

## Backend Design

### Commands (State Mutations)

| Command | Handler | Description |
|---------|---------|-------------|
| `AddToLearningCommand` | `AddToLearningHandler` | Creates `UserWordSenseProgress` or restores archived record. Returns `{ id }`. |
| `RemoveFromLearningCommand` | `RemoveFromLearningHandler` | Sets `archivedAt = now()` on progress record. Returns `null`. |

### Queries (Read Operations)

| Query | Handler | Description |
|-------|---------|-------------|
| `SearchWordSensesQuery` | `SearchWordSensesHandler` | ILIKE search on `words.normalized_text`, JOINs `word_senses`. Returns paginated list. |
| `GetWordSenseDetailQuery` | `GetWordSenseDetailHandler` | Returns full WordSense details. Optionally includes learning state if userId provided. |
| `GetLearningListQuery` | `GetLearningListHandler` | Returns user's active (non-archived) progress records with word sense data. Paginated. |

### API Endpoints

| Method | Endpoint | Auth | Handler | Description |
|--------|----------|------|---------|-------------|
| `GET` | `/api/v1/dictionary/search` | Public | `SearchWordSensesQuery` | Search word senses |
| `GET` | `/api/v1/dictionary/senses/:senseId` | Optional | `GetWordSenseDetailQuery` | Get sense details |
| `POST` | `/api/v1/learning/senses` | Required | `AddToLearningCommand` | Add to learning |
| `DELETE` | `/api/v1/learning/senses/:senseId` | Required | `RemoveFromLearningCommand` | Remove from learning |
| `GET` | `/api/v1/learning/senses` | Required | `GetLearningListQuery` | Get learning list |

---

## Frontend Design

### Pages & Routes

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/dictionary` | `DictionarySearchPage` | Search + results with as-you-type |
| `/dictionary/senses/:senseId` | `WordSenseDetailPage` | Full sense details + "Add to Learning" |
| `/learning` | `MyLearningPage` | User's learning list |

### State Management

| Store/Hook | Type | Purpose |
|------------|------|---------|
| `useSearchWordSenses` | TanStack Query | Server state: search results |
| `useWordSenseDetail` | TanStack Query | Server state: sense details |
| `useLearningList` | TanStack Query | Server state: learning list |
| `useAddToLearning` | TanStack Query (mutation) | Mutation: add sense to learning |
| `useRemoveFromLearning` | TanStack Query (mutation) | Mutation: remove sense |
| `useSearchStore` | Zustand | UI state: search query string, debounce |

### Components

| Component | Shadcn Base | Purpose |
|-----------|-------------|---------|
| `SearchInput` | `Input` | Debounced search input |
| `SearchResultsList` | `Card` | Grid/list of matching senses |
| `WordSenseCard` | `Card` | Compact sense display in search results |
| `WordSenseDetail` | `Card`, `Badge` | Full sense details view |
| `LearningList` | `Table` or `Card` | Paginated learning list |
| `AddToLearningButton` | `Button` | "Add / Already Learning" toggle |

---

## Testing Strategy

### Backend Tests

| Type | Location | Scope |
|------|----------|-------|
| Unit | `server/src/modules/learning/**/*.spec.ts` | Domain logic, handlers |
| Unit | `server/src/modules/dictionary/**/*.spec.ts` | Search/detail handlers |
| Integration | `server/test/learning/` | API endpoints, CQRS flow |

### Frontend Tests

| Type | Location | Scope |
|------|----------|-------|
| Unit | `client/src/modules/learning/**/*.test.ts` | Components, hooks, utils |
| E2E | `client/e2e/learning/` | Search → View → Add flow |

---

## Verification Plan

### Automated Verification
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Lint and type checks pass
- [ ] API contracts match OpenAPI spec

### Manual Verification
- [ ] Search "book" → see noun + verb senses
- [ ] View sense detail → all fields displayed correctly
- [ ] Add to learning → button changes to "Already Learning"
- [ ] View learning list → added sense appears
- [ ] Remove from learning → sense disappears from list
- [ ] Re-add → progress is restored
- [ ] Search without auth → works
- [ ] Add without auth → prompts login

---

## Core/Shared Usage Justification

N/A — All code resides in feature modules (`learning` and `dictionary`).

---

## Complexity Tracking

No constitution violations. All endpoints and handlers comply with CQRS rules.

---

## Open Questions

- [x] All questions resolved during research phase — see `research.md`
