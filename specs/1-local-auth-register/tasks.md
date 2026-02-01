# Tasks: Local Auth Register with Tenant Creation

**Input**: Design documents from `/specs/1-local-auth-register/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/

**Tests**: Tests will be implemented as part of verification, not TDD.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `server/src/modules/auth/`
- **Frontend**: `client/src/modules/auth/`
- **Core infrastructure**: `server/src/core/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and auth module scaffolding

- [x] T001 Create auth module directory structure at `server/src/modules/auth/` per plan.md
- [x] T002 Create auth module NestJS definition at `server/src/modules/auth/auth.module.ts`
- [x] T003 [P] Install bcrypt dependency: `npm install bcrypt && npm install --save-dev @types/bcrypt` in `server/`
- [x] T004 [P] Register auth module in `server/src/app.module.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core entities and infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Domain Entities

- [x] T005a [P] Create Tenant domain entity at `server/src/modules/auth/domain/entities/tenant.entity.ts`
- [x] T005b [P] Create User domain entity at `server/src/modules/auth/domain/entities/user.entity.ts`
- [x] T005c [P] Create AuthIdentity domain entity at `server/src/modules/auth/domain/entities/auth-identity.entity.ts`

### Database Entities (MikroORM)

- [x] T005 [P] Create Tenant ORM entity at `server/src/modules/auth/infrastructure/persistence/tenant.orm-entity.ts`
- [x] T006 [P] Create User ORM entity at `server/src/modules/auth/infrastructure/persistence/user.orm-entity.ts`
- [x] T007 [P] Create AuthIdentity ORM entity at `server/src/modules/auth/infrastructure/persistence/auth-identity.orm-entity.ts`
- [x] T008 Generate and run MikroORM migration for auth entities

### Domain Value Objects

- [x] T009 [P] Create Email value object at `server/src/modules/auth/domain/value-objects/email.vo.ts`
- [x] T010 [P] Create Password value object at `server/src/modules/auth/domain/value-objects/password.vo.ts` (bcrypt hashing logic)
- [x] T011 [P] Create Username value object at `server/src/modules/auth/domain/value-objects/username.vo.ts`

### Domain Services

- [x] T012 Create UsernameGenerator service at `server/src/modules/auth/domain/services/username-generator.service.ts`

### Repository Interfaces

- [x] T013 [P] Create TenantRepository interface at `server/src/modules/auth/domain/repositories/tenant.repository.interface.ts`
- [x] T014 [P] Create UserRepository interface at `server/src/modules/auth/domain/repositories/user.repository.interface.ts`
- [x] T015 [P] Create AuthIdentityRepository interface at `server/src/modules/auth/domain/repositories/auth-identity.repository.interface.ts`

### Repository Implementations

- [x] T016 [P] Implement TenantRepository at `server/src/modules/auth/infrastructure/repositories/tenant.repository.ts`
- [x] T017 [P] Implement UserRepository at `server/src/modules/auth/infrastructure/repositories/user.repository.ts`
- [x] T018 [P] Implement AuthIdentityRepository at `server/src/modules/auth/infrastructure/repositories/auth-identity.repository.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: A new user can create an account with email/password, which creates a new tenant and assigns them as ADMIN

**Independent Test**: POST to `/api/v1/auth/register` with valid data → returns userId, email, tenantId + creates DB records

### DTOs

- [ ] T019 [P] [US1] Create RegisterRequestDto at `server/src/modules/auth/dto/requests/register.request.dto.ts`
- [ ] T020 [P] [US1] Create RegisterResponseDto at `server/src/modules/auth/dto/responses/register.response.dto.ts`

### CQRS Command

- [ ] T021 [US1] Create RegisterCommand at `server/src/modules/auth/application/commands/register.command.ts`
- [ ] T022 [US1] Implement RegisterHandler at `server/src/modules/auth/application/commands/register.handler.ts` (orchestrates User+Tenant+AuthIdentity creation)

### Controller

- [ ] T023 [US1] Create AuthController with POST /auth/register endpoint at `server/src/modules/auth/controllers/auth.controller.ts`

### Wire Up Module

- [ ] T024 [US1] Register command handler, repositories, and controller in `server/src/modules/auth/auth.module.ts`

### Backend Verification

- [ ] T025 [US1] Verify endpoint works: test with curl/Postman → user, tenant, auth_identity created in DB

**Checkpoint**: Backend for User Story 1 complete and testable

---

## Phase 4: User Story 2 - Duplicate Email Prevention (Priority: P1)

**Goal**: System prevents registration with an already-registered LOCAL email, returning 409 Conflict

**Independent Test**: Register email, then re-register same email → receive EMAIL_ALREADY_EXISTS error

### Implementation

- [ ] T026 [US2] Add findByProviderAndProviderUserId method to AuthIdentityRepository at `server/src/modules/auth/infrastructure/repositories/auth-identity.repository.ts`
- [ ] T027 [US2] Add duplicate email check in RegisterHandler at `server/src/modules/auth/application/commands/register.handler.ts`
- [ ] T028 [US2] Create EmailAlreadyExistsException at `server/src/modules/auth/domain/exceptions/email-already-exists.exception.ts`

### Verification

- [ ] T029 [US2] Verify duplicate email returns 409 with EMAIL_ALREADY_EXISTS error code

**Checkpoint**: User Story 2 complete - duplicate emails are rejected

---

## Phase 5: User Story 3 - Input Validation (Priority: P2)

**Goal**: System validates all inputs and returns clear validation error messages

**Independent Test**: Submit invalid email/password/name → receive detailed validation errors per field

### Implementation

- [ ] T030 [US3] Add class-validator decorators to RegisterRequestDto at `server/src/modules/auth/dto/requests/register.request.dto.ts`
- [ ] T031 [US3] Add custom password validation decorator at `server/src/modules/auth/dto/validators/password.validator.ts`
- [ ] T032 [US3] Ensure ValidationPipe is applied globally or on AuthController

### Verification

- [ ] T033 [US3] Verify validation errors: invalid email → INVALID_FORMAT error
- [ ] T034 [US3] Verify validation errors: weak password → PASSWORD_POLICY error with requirements
- [ ] T035 [US3] Verify validation errors: empty required fields → REQUIRED error per field

**Checkpoint**: User Story 3 complete - all inputs validated with clear messages

---

## Phase 6: Frontend Implementation

**Goal**: Registration page with form, validation, and API integration

### Module Structure

- [ ] T036 [P] Create auth module directory structure at `client/src/modules/auth/`
- [ ] T037 [P] Create auth types at `client/src/modules/auth/types/auth.types.ts`

### API Layer

- [ ] T038 Create auth API service at `client/src/modules/auth/services/auth.api.ts`
- [ ] T039 Create useRegister mutation hook at `client/src/modules/auth/hooks/use-register.ts`

### Components

- [ ] T040 [P] Create PasswordInput component at `client/src/modules/auth/components/password-input.tsx`
- [ ] T041 Create RegisterForm component at `client/src/modules/auth/components/register-form.tsx`

### Page and Route

- [ ] T042 Create RegisterPage at `client/src/modules/auth/pages/register.page.tsx`
- [ ] T043 Add /register route to `client/src/routes.ts`
- [ ] T044 Create module barrel export at `client/src/modules/auth/index.ts`

### Frontend Verification

- [ ] T045 Verify register page loads at localhost:3000/register
- [ ] T046 Verify successful registration redirects to login page
- [ ] T047 Verify validation errors display inline in form

**Checkpoint**: Frontend complete and integrated with backend

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T048 Add security logging for registration attempts in RegisterHandler
- [ ] T049 [P] Add OpenAPI/Swagger documentation to AuthController
- [ ] T050 Run quickstart.md validation: test all curl commands
- [ ] T051 Verify database: password is hashed (starts with $2b$12$)
- [ ] T052 Code review: ensure no plain-text passwords in logs or responses

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 can proceed independently
  - US2 extends US1 (adds duplicate check to RegisterHandler)
  - US3 can proceed in parallel with US2 (adds validation to DTOs)
- **Frontend (Phase 6)**: Depends on backend US1 completion (needs working API)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Run In Parallel With |
|-------|------------|-------------------------|
| US1 (Registration) | Foundational only | - |
| US2 (Duplicate Prevention) | US1 (adds logic to RegisterHandler) | US3 |
| US3 (Input Validation) | Foundational only | US2 |

### Within Each User Story

- DTOs before handlers
- Handlers before controllers
- Controllers before verification

### Parallel Opportunities

**Phase 2 (Foundational):**
```
Parallel Group A: T005, T006, T007 (ORM entities)
Parallel Group B: T009, T010, T011 (Value objects)
Parallel Group C: T013, T014, T015 (Repository interfaces)
Parallel Group D: T016, T017, T018 (Repository implementations)
```

**Phase 3 (US1):**
```
Parallel: T019, T020 (DTOs)
```

**Phase 6 (Frontend):**
```
Parallel: T036, T037 (Structure and types)
Parallel: T040, T041 (Components - after API layer)
```

---

## Parallel Example: Foundational Phase

```bash
# Launch all ORM entities together:
T005: Create Tenant ORM entity
T006: Create User ORM entity
T007: Create AuthIdentity ORM entity

# Then launch all value objects together:
T009: Create Email value object
T010: Create Password value object
T011: Create Username value object
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test registration endpoint via curl/Postman
5. Basic registration works → MVP achieved

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Backend MVP
3. Add User Story 2 → Duplicates prevented
4. Add User Story 3 → Validation complete
5. Add Frontend → Full feature complete

### Task Summary

| Phase | Task Count | Parallel Opportunities |
|-------|------------|----------------------|
| Phase 1: Setup | 4 | 2 |
| Phase 2: Foundational | 14 | 12 |
| Phase 3: US1 | 7 | 2 |
| Phase 4: US2 | 4 | 0 |
| Phase 5: US3 | 6 | 0 |
| Phase 6: Frontend | 12 | 4 |
| Phase 7: Polish | 5 | 1 |
| **Total** | **52** | **21** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
