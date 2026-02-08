# Implementation Plan: Workspace Onboarding Wizard

**Branch**: `003-workspace-onboarding` | **Date**: 2026-02-08 | **Spec**: [spec.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/003-workspace-onboarding/spec.md)  
**Input**: Feature specification from `/specs/003-workspace-onboarding/spec.md`

---

## Summary

Implement a 4-step wizard for workspace creation in a language-learning SaaS. Users without workspaces are redirected to the wizard, complete the setup, and are redirected to the dashboard. The implementation follows CQRS architecture on backend with NestJS, and uses TanStack Query + Zustand on frontend per Constitution requirements.

---

## Technical Context

| Attribute | Value |
|-----------|-------|
| **Frontend** | React 18, TanStack Router, TanStack Query, Zustand, Shadcn UI |
| **Backend** | NestJS, CQRS (`@nestjs/cqrs`), MikroORM |
| **Database** | PostgreSQL |
| **Testing** | Jest (backend), Vitest (frontend) |
| **API Style** | REST, versioned (`/api/v1/...`), OpenAPI documented |

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
- [x] Responses conform to the standard schema
- [x] Endpoints adhere to the API contract specification

### Frontend State (§12)
- [x] Server state uses TanStack Query only
- [x] Client/UI state uses Zustand only
- [x] No backend business rules duplicated on frontend

### Observability (§8)
- [x] Structured logging with tenant ID, user ID, correlation ID
- [x] Errors are traceable via correlation IDs

### Design for Extensibility & Maintainability (§18)
- [x] Favors design patterns promoting loose coupling
- [x] Avoids tight coupling between components

---

## Proposed Changes

### Backend: Workspace Module

#### [NEW] [workspace.module.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/workspace.module.ts)
NestJS module definition following auth module pattern.

#### [NEW] [workspace.controller.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/controllers/workspace.controller.ts)
REST controller with endpoints:
- `POST /api/v1/workspaces` → CreateWorkspaceCommand
- `GET /api/v1/workspaces` → ListWorkspacesQuery
- `GET /api/v1/workspaces/check` → CheckHasWorkspaceQuery
- `GET /api/v1/workspaces/:id` → GetWorkspaceQuery

---

#### [NEW] [workspace.entity.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/domain/entities/workspace.entity.ts)
Domain entity extending AggregateRoot with all workspace properties.

#### [NEW] [workspace.orm-entity.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/infrastructure/persistence/workspace.orm-entity.ts)
MikroORM entity for database persistence.

#### [NEW] [workspace.mapper.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/infrastructure/mappers/workspace.mapper.ts)
Mapper between domain entity and ORM entity.

---

#### [NEW] [create-workspace.command.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/application/commands/create-workspace.command.ts)
Command definition for workspace creation.

#### [NEW] [create-workspace.handler.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/application/commands/create-workspace.handler.ts)
Command handler implementing creation logic with uniqueness validation.

---

#### [NEW] [list-workspaces.query.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/application/queries/list-workspaces.query.ts)
Query definition for listing user's workspaces.

#### [NEW] [list-workspaces.handler.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/application/queries/list-workspaces.handler.ts)
Query handler returning workspace list.

#### [NEW] [check-has-workspace.query.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/application/queries/check-has-workspace.query.ts)
Query definition for workspace existence check.

#### [NEW] [check-has-workspace.handler.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/application/queries/check-has-workspace.handler.ts)
Query handler returning boolean has-workspace status.

---

#### [NEW] [workspace-enums.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/domain/enums/workspace-enums.ts)
Enum definitions: WorkspaceType, Language, LearningGoal, Level, LearningMode.

#### [NEW] [workspace.repository.interface.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/domain/repositories/workspace.repository.interface.ts)
Repository interface with provider factory.

#### [NEW] [workspace.repository.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/modules/workspace/infrastructure/repositories/workspace.repository.ts)
Repository implementation using MikroORM.

---

#### [NEW] DTOs
- `create-workspace.request.dto.ts` - Request validation
- `workspace.response.dto.ts` - Response DTO
- `has-workspace.response.dto.ts` - Check response DTO

---

#### [MODIFY] [app.module.ts](file:///e:/Projects/multi-tenant/easy-english-v2/server/src/app.module.ts)
Import WorkspaceModule.

---

### Frontend: Workspace Module

#### [NEW] [workspace-wizard-page.tsx](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/pages/workspace-wizard-page.tsx)
Main wizard page component with step navigation.

#### [NEW] [wizard-step-basics.tsx](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/components/wizard-step-basics.tsx)
Step 1: Name and description input.

#### [NEW] [wizard-step-context.tsx](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/components/wizard-step-context.tsx)
Step 2: Language, workspace type, learning goal, level selection.

#### [NEW] [wizard-step-preferences.tsx](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/components/wizard-step-preferences.tsx)
Step 3: Daily target, reminder, learning mode (skippable).

#### [NEW] [wizard-step-review.tsx](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/components/wizard-step-review.tsx)
Step 4: Summary and create button.

#### [NEW] [wizard-progress-bar.tsx](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/components/wizard-progress-bar.tsx)
Progress indicator component.

---

#### [NEW] [workspace.api.ts](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/services/workspace.api.ts)
API service for workspace endpoints.

#### [NEW] [use-create-workspace.ts](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/hooks/use-create-workspace.ts)
TanStack Query mutation hook.

#### [NEW] [use-has-workspace.ts](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/hooks/use-has-workspace.ts)
TanStack Query hook for workspace check.

#### [NEW] [use-wizard-store.ts](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/stores/use-wizard-store.ts)
Zustand store for wizard UI state (current step, form data).

---

#### [NEW] [workspace.types.ts](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/workspace/types/workspace.types.ts)
TypeScript types matching API contracts.

---

#### [MODIFY] [routes.ts](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/routes.ts)
Add `/workspace/new` route under authenticated layout.

#### [MODIFY] [authenticated-layout.tsx](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/modules/shell/pages/authenticated-layout.tsx)
Add redirect logic for users without workspaces.

#### [MODIFY] [routes.ts constant](file:///e:/Projects/multi-tenant/easy-english-v2/client/src/shared/constants/routes.ts)
Add `WORKSPACE.NEW` route constant.

---

## Backend Design

### Commands (State Mutations)

| Command | Handler | Description |
|---------|---------|-------------|
| `CreateWorkspaceCommand` | `CreateWorkspaceHandler` | Creates new workspace, validates name uniqueness per user |

### Queries (Read Operations)

| Query | Handler | Description |
|-------|---------|-------------|
| `ListWorkspacesQuery` | `ListWorkspacesHandler` | Returns user's workspaces |
| `CheckHasWorkspaceQuery` | `CheckHasWorkspaceHandler` | Returns boolean + count |
| `GetWorkspaceQuery` | `GetWorkspaceHandler` | Returns single workspace by ID |

### API Endpoints

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| `POST` | `/api/v1/workspaces` | `CreateWorkspaceCommand` | Create workspace |
| `GET` | `/api/v1/workspaces` | `ListWorkspacesQuery` | List user's workspaces |
| `GET` | `/api/v1/workspaces/check` | `CheckHasWorkspaceQuery` | Check if user has workspace |
| `GET` | `/api/v1/workspaces/:id` | `GetWorkspaceQuery` | Get workspace by ID |

---

## Frontend Design

### Pages & Routes

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/workspace/new` | `WorkspaceWizardPage` | 4-step wizard for workspace creation |

### State Management

| Store/Hook | Type | Purpose |
|------------|------|---------|
| `useHasWorkspace` | TanStack Query | Server state: check if user has workspace |
| `useCreateWorkspace` | TanStack Query | Mutation: create new workspace |
| `useWizardStore` | Zustand | UI state: current step, form data across steps |

### Components

| Component | Shadcn Base | Purpose |
|-----------|-------------|---------|
| `WorkspaceWizardPage` | `Card` | Main wizard container |
| `WizardStepBasics` | `Input`, `Textarea` | Name + description input |
| `WizardStepContext` | `Select`, `RadioGroup` | Language + type selection |
| `WizardStepPreferences` | `Slider`, `Switch`, `RadioGroup` | Preferences config |
| `WizardStepReview` | `Card`, `Badge` | Summary display |
| `WizardProgressBar` | Custom | Step progress indicator |

---

## Verification Plan

### Automated Tests

> [!IMPORTANT]
> No existing tests for workspace module. New tests will be created.

**Backend (Jest):**
```bash
cd server
npm run test -- --testPathPattern=workspace
```

Tests to implement:
- `CreateWorkspaceHandler` unit test - validates workspace creation
- `ListWorkspacesHandler` unit test - validates workspace listing
- Integration test for `/api/v1/workspaces` endpoints

**Frontend (Vitest):**
```bash
cd client
npm run test -- --run workspace
```

Tests to implement:
- `useWizardStore` unit test - validates state management
- `WizardStepBasics` component test - validates form input

### Manual Verification

1. **Complete wizard flow**: Login → Redirect to `/workspace/new` → Complete 4 steps → Redirect to dashboard
2. **Validation errors**: Leave name empty → Verify error message
3. **Skip preferences**: Complete Steps 1-2 → Click Skip on Step 3 → Verify defaults applied
4. **Duplicate name**: Create workspace → Try creating another with same name → Verify 409 error

---

## Core/Shared Usage Justification

N/A - All code resides in feature modules (`server/src/modules/workspace/`, `client/src/modules/workspace/`).

---

## Open Questions

- [ ] None - all clarifications resolved
