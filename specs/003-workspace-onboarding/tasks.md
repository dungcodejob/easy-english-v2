# Tasks: Workspace Onboarding Wizard

**Input**: Design documents from `/specs/003-workspace-onboarding/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `server/src/modules/workspace/`
- **Frontend**: `client/src/modules/workspace/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create workspace module structure and shared dependencies

- [x] T001 Create workspace module folder structure at `server/src/modules/workspace/`
- [x] T002 [P] Create workspace enums in `server/src/modules/workspace/domain/enums/workspace-enums.ts`
- [x] T003 [P] Create Workspace domain entity in `server/src/modules/workspace/domain/entities/workspace.entity.ts`
- [x] T004 [P] Create WorkspaceOrmEntity in `server/src/modules/workspace/infrastructure/persistence/workspace.orm-entity.ts`
- [x] T005 [P] Create WorkspaceMapper in `server/src/modules/workspace/infrastructure/mappers/workspace.mapper.ts`
- [x] T006 Create workspace module folder structure at `client/src/modules/workspace/`
- [x] T007 [P] Create workspace types in `client/src/modules/workspace/types/workspace.types.ts`
- [x] T008 [P] Add WORKSPACE route constants in `client/src/shared/constants/routes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create workspace repository interface in `server/src/modules/workspace/domain/repositories/workspace.repository.interface.ts`
- [x] T010 Create workspace repository implementation in `server/src/modules/workspace/infrastructure/repositories/workspace.repository.ts`
- [x] T011 [P] Create CreateWorkspaceRequestDto in `server/src/modules/workspace/dto/requests/create-workspace.request.dto.ts`
- [x] T012 [P] Create WorkspaceResponseDto in `server/src/modules/workspace/dto/responses/workspace.response.dto.ts`
- [x] T013 [P] Create HasWorkspaceResponseDto in `server/src/modules/workspace/dto/responses/has-workspace.response.dto.ts`
- [x] T014 [P] Create WorkspaceCreatedEvent in `server/src/modules/workspace/events/workspace-created.event.ts`
- [x] T014 Create workspace.module.ts with all providers in `server/src/modules/workspace/workspace.module.ts`
- [x] T015 Import WorkspaceModule in `server/src/app.module.ts`
- [x] T016 Create workspace API service in `client/src/modules/workspace/services/workspace.api.ts`
- [x] T017 Create useWizardStore Zustand store in `client/src/modules/workspace/stores/use-wizard-store.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Complete Basic Workspace Setup (Priority: P1) 🎯 MVP

**Goal**: Users without workspaces are redirected to wizard, complete 4 steps, and are redirected to dashboard.

**Independent Test**: Create new account → Login → Auto-redirect to `/workspace/new` → Complete 4 steps → Redirected to dashboard with workspace created.

### Backend Implementation for User Story 1

- [x] T018 [P] [US1] Create CreateWorkspaceCommand in `server/src/modules/workspace/application/commands/create-workspace.command.ts`
- [x] T019 [P] [US1] Create CheckHasWorkspaceQuery in `server/src/modules/workspace/application/queries/check-has-workspace.query.ts`
- [x] T020 [US1] Create CreateWorkspaceHandler with uniqueness validation in `server/src/modules/workspace/application/commands/create-workspace.handler.ts`
- [x] T021 [US1] Create CheckHasWorkspaceHandler in `server/src/modules/workspace/application/queries/check-has-workspace.handler.ts`
- [x] T022 [US1] Create WorkspaceController with POST /workspaces and GET /workspaces/check in `server/src/modules/workspace/controllers/workspace.controller.ts`

- [x] T023 [US1] Register command and query handlers in workspace.module.ts

### Frontend Implementation for User Story 1

- [x] T024 [P] [US1] Create useCreateWorkspace mutation hook in `client/src/modules/workspace/hooks/use-create-workspace.ts`
- [x] T025 [P] [US1] Create useHasWorkspace query hook in `client/src/modules/workspace/hooks/use-has-workspace.ts`
- [x] T026 [US1] Create WizardStepBasics component (name, description) in `client/src/modules/workspace/components/wizard-step-basics.tsx`
- [x] T027 [US1] Create WizardStepContext component (language, type, goal, level) in `client/src/modules/workspace/components/wizard-step-context.tsx`
- [x] T028 [US1] Create WizardStepPreferences component (dailyTarget, reminder, mode) in `client/src/modules/workspace/components/wizard-step-preferences.tsx`
- [x] T029 [US1] Create WizardStepReview component (summary, create button) in `client/src/modules/workspace/components/wizard-step-review.tsx`
- [x] T030 [US1] Create WorkspaceWizardPage with step navigation in `client/src/modules/workspace/pages/workspace-wizard-page.tsx`
- [x] T031 [US1] Add /workspace/new route in `client/src/routes.ts`
- [x] T032 [US1] Add redirect logic for users without workspace in `client/src/modules/shell/pages/authenticated-layout.tsx`
- [x] T033 [US1] Create module index exports in `client/src/modules/workspace/index.ts`

**Checkpoint**: User Story 1 complete - core wizard flow functional

---

## Phase 4: User Story 2 - Navigate Back Through Steps (Priority: P2)

**Goal**: Users can navigate back through wizard steps without losing entered data.

**Independent Test**: Fill Steps 1-3 → Click Back to Step 1 → Verify data preserved → Modify and proceed → Data updates correctly.

### Implementation for User Story 2

- [x] T034 [US2] Enhance useWizardStore with step data persistence in `client/src/modules/workspace/stores/use-wizard-store.ts`
- [x] T035 [US2] Add Back button logic to WizardStepContext in `client/src/modules/workspace/components/new-wizard/workspace-basics-step.tsx`
- [x] T036 [US2] Add Back button logic to WizardStepPreferences in `client/src/modules/workspace/components/new-wizard/workspace-learning-step.tsx`
- [x] T037 [US2] Add Back button logic to WizardStepPreferences in `client/src/modules/workspace/components/new-wizard/workspace-preferences-step.tsx`
- [x] T038 [US2] Add Back button logic to WizardStepReview in `client/src/modules/workspace/components/new-wizard/workspace-review-step.tsx`

**Checkpoint**: User Story 2 complete - navigation with data preservation working

---

## Phase 5: User Story 3 - Skip Optional Preferences (Priority: P2)

**Goal**: Users can skip Step 3 and proceed with default values.

**Independent Test**: Complete Steps 1-2 → Click Skip on Step 3 → Verify default values in review.

### Implementation for User Story 3

- [ ] T039 [US3] Add Skip button to WizardStepPreferences in `client/src/modules/workspace/components/new-wizard/workspace-preferences-step.tsx`
- [ ] T040 [US3] Apply default values in useWizardStore when skipping in `client/src/modules/workspace/stores/use-wizard-store.ts`
- [ ] T041 [US3] Display default values indicator in WizardStepReview in `client/src/modules/workspace/components/new-wizard/workspace-review-step.tsx`

**Checkpoint**: User Story 3 complete - skip functionality working

---

## Phase 6: User Story 4 - Handle Workspace Creation Failure (Priority: P2)

**Goal**: Users see error feedback when workspace creation fails and can retry.

**Independent Test**: Trigger API error → Toast appears → Retry works → Back button preserves data.

### Implementation for User Story 4

- [ ] T042 [US4] Add error handling to useCreateWorkspace hook in `client/src/modules/workspace/hooks/use-create-workspace.ts`
- [ ] T043 [US4] Display error toast in WizardStepReview in `client/src/modules/workspace/components/new-wizard/workspace-review-step.tsx`
- [ ] T044 [US4] Add retry logic and loading state to Create button in `client/src/modules/workspace/components/new-wizard/workspace-review-step.tsx`

**Checkpoint**: User Story 4 complete - error handling working

---

## Phase 7: User Story 5 - View Progress Indicator (Priority: P3)

**Goal**: Users see visual progress indicator across all steps.

**Independent Test**: Navigate through steps → Progress bar updates and animates.

### Implementation for User Story 5

- [ ] T045 [US5] Create WizardProgressBar component in `client/src/modules/workspace/components/wizard-progress-bar.tsx`
- [ ] T046 [US5] Integrate progress bar in WorkspaceWizardPage in `client/src/modules/workspace/pages/workspace-wizard-page.tsx`
- [ ] T047 [US5] Add step transition animations (fade/slide) in `client/src/modules/workspace/pages/workspace-wizard-page.tsx`

**Checkpoint**: User Story 5 complete - progress indicator working

---

## Phase 8: Backend Queries (Additional Endpoints)

**Purpose**: Additional backend endpoints for workspace management

- [ ] T048 [P] Create ListWorkspacesQuery in `server/src/modules/workspace/application/queries/list-workspaces.query.ts`
- [ ] T049 [P] Create GetWorkspaceQuery in `server/src/modules/workspace/application/queries/get-workspace.query.ts`
- [ ] T050 Create ListWorkspacesHandler in `server/src/modules/workspace/application/queries/list-workspaces.handler.ts`
- [ ] T051 Create GetWorkspaceHandler in `server/src/modules/workspace/application/queries/get-workspace.handler.ts`
- [ ] T052 Add GET /workspaces and GET /workspaces/:id to WorkspaceController in `server/src/modules/workspace/controllers/workspace.controller.ts`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T053 [P] Add inline validation error styling to all wizard steps
- [ ] T054 [P] Add form field focus management for accessibility
- [ ] T055 Run manual verification per quickstart.md scenarios
- [ ] T056 Clean up unused imports and code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Core MVP
- **User Story 2-4 (Phase 4-6)**: Can start after US1 (P2 stories)
- **User Story 5 (Phase 7)**: Can start after US1 (P3 story)
- **Backend Queries (Phase 8)**: Can run in parallel with user stories
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1 | P1 | Foundational | Phase 2 |
| US2 | P2 | US1 (builds on wizard) | Phase 3 |
| US3 | P2 | US1 (builds on wizard) | Phase 3 |
| US4 | P2 | US1 (builds on wizard) | Phase 3 |
| US5 | P3 | US1 (builds on wizard) | Phase 3 |

### Parallel Opportunities

**Phase 1 (Setup):**
```
T002, T003, T004, T005 (backend domain) → parallel
T007, T008 (frontend types) → parallel
```

**Phase 2 (Foundational):**
```
T011, T012, T013 (DTOs) → parallel after T009-T010
T016, T017 (frontend foundation) → parallel
```

**Phase 3 (US1):**
```
T018, T019 (command/query definitions) → parallel
T024, T025 (hooks) → parallel
T026, T027, T028, T029 (step components) → parallel after store
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test wizard flow independently
5. Deploy/demo if MVP ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Test → Deploy (MVP!)
3. User Story 2-4 → Test each → Deploy (P2 features)
4. User Story 5 → Test → Deploy (P3 polish)
5. Polish → Final QA

---

## Notes

- Tests not included per spec (no explicit test requirement)
- [P] tasks = different files, no dependencies
- [Story] label maps to spec.md user stories
- Each story is independently testable after Phase 3
- Verify each checkpoint before proceeding
