# Research: Workspace Onboarding Wizard

**Feature**: 003-workspace-onboarding  
**Date**: 2026-02-08

---

## Technical Context Resolution

### 1. Workspace-User Relationship

**Decision**: One-to-Many (User can have multiple workspaces)

**Rationale**: User clarification confirmed multiple workspaces per user. This enables power users to organize learning by context (e.g., work vocabulary, exam prep, casual learning).

**Alternatives Considered**:
- One-to-One (rejected per user clarification)

---

### 2. Workspace Name Uniqueness

**Decision**: Unique per user only (not globally unique)

**Rationale**: User clarification confirmed this. Allows multiple users to have workspaces named "English Learning" without conflicts, reducing friction.

**Alternatives Considered**:
- Global uniqueness (rejected - unnecessary constraint)

---

### 3. Data Persistence Strategy

**Decision**: All wizard fields persist to database via API

**Rationale**: User explicitly requested storing all fields (workspaceType, learningGoal, level, dailyTarget, studyReminder, defaultLearningMode) in the database.

**Fields to Persist**:
- `name` (string, required, 1-100 chars)
- `description` (string, optional)
- `workspaceType` (enum: PERSONAL | TEAM | CLASSROOM, default: PERSONAL)
- `language` (enum: EN | VI | ES | FR | DE | JA | KO | ZH, required)
- `learningGoal` (enum: VOCABULARY | EXAM_PREP | DAILY_PRACTICE, default: VOCABULARY)
- `level` (enum: BEGINNER | INTERMEDIATE | ADVANCED, default: BEGINNER)
- `dailyTarget` (number, 1-100, default: 10)
- `studyReminder` (boolean, default: false)
- `defaultLearningMode` (enum: FLASHCARD | QUIZ | SPACED_REPETITION, default: FLASHCARD)

**Alternatives Considered**:
- Frontend-only storage (rejected per user request)

---

### 4. Multi-Tenancy Model

**Decision**: Workspace is tenant-scoped via `tenantId`

**Rationale**: Constitution §3 mandates tenant data isolation. Each workspace belongs to a tenant, and has a `userId` to track the creator/owner.

**Implementation**:
- `WorkspaceOrmEntity` includes `tenantId` column
- All queries filter by `tenantId` from request context
- `userId` tracks workspace ownership within tenant

---

### 5. Backend Module Pattern

**Decision**: Follow existing `auth` module CQRS pattern

**Rationale**: Constitution §2 mandates CQRS. The `auth` module demonstrates the pattern well:
- AggregateRoot entities with static `create()` and `rehydrate()`
- Command handlers for mutations (return ID only)
- Query handlers for reads
- Repository interfaces with `provide*` factory functions
- ORM entities separate from domain entities with mappers

---

### 6. Frontend State Management

**Decision**: TanStack Query for server state, Zustand for wizard UI state

**Rationale**: Constitution §12 mandates this separation. The wizard needs:
- Zustand store for local wizard state (current step, form data across steps)
- TanStack Query mutation for final workspace creation API call

---

### 7. Routing Strategy

**Decision**: Add `/workspace/new` route under authenticated layout

**Rationale**: Existing `routes.ts` uses TanStack Virtual File Routes with authenticated/unauthenticated layouts. The wizard route should:
- Be protected (require authentication)
- Redirect users without workspaces automatically

---

### 8. Redirect Logic Location

**Decision**: Implement in authenticated layout guard

**Rationale**: The authenticated layout already handles auth checks. Add workspace check to redirect users without workspaces to `/workspace/new`.

---

## Codebase Patterns Discovered

### Backend Patterns

| Pattern | Example | Location |
|---------|---------|----------|
| Entity definition | `User`, `Tenant` | `server/src/modules/auth/domain/entities/` |
| AggregateRoot base | `AggregateRoot` | `server/src/core/ddd/aggregate-root.base.ts` |
| Command handler | `LoginHandler` | `server/src/modules/auth/application/commands/` |
| Query handler | `GetSessionHandler` | `server/src/modules/auth/application/queries/` |
| Repository interface | `provideUserRepository` | `server/src/modules/auth/domain/repositories/` |
| ORM entity | `UserOrmEntity` | `server/src/modules/auth/infrastructure/persistence/` |
| Mapper | `UserMapper` | `server/src/modules/auth/infrastructure/mappers/` |

### Frontend Patterns

| Pattern | Example | Location |
|---------|---------|----------|
| API service | `authApi` | `client/src/modules/auth/services/auth.api.ts` |
| Mutation hook | `useLogin` | `client/src/modules/auth/hooks/use-login.ts` |
| API client | `api` | `client/src/core/api/` |
| Route definition | `routes` | `client/src/routes.ts` |
| Constants | `APP_ROUTES` | `client/src/shared/constants/routes` |

---

## Open Questions Resolved

All questions resolved via user clarification:
- ✅ Workspace uniqueness scope
- ✅ Multiple workspaces per user
- ✅ Data persistence strategy
