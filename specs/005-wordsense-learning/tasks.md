# Tasks: WordSense Learning

**Input**: Design documents from `/specs/005-wordsense-learning/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Learning module structure and database schema

- [x] T001 Create Learning module directory structure per plan.md at `server/src/modules/learning/`
- [x] T002 Create `LearningModule` NestJS module definition in `server/src/modules/learning/learning.module.ts`
- [x] T003 Register `LearningModule` in `server/src/app.module.ts` imports
- [x] T004 Create MikroORM migration for `user_word_sense_progress` table per data-model.md
- [x] T005 [P] Create `UserWordSenseProgressOrmEntity` MikroORM entity in `server/src/modules/learning/infrastructure/persistence/user-word-sense-progress.orm-entity.ts`
- [x] T006 [P] Create `ILearningRepository` interface in `server/src/modules/learning/domain/repositories/learning.repository.interface.ts`
- [x] T007 Implement `LearningRepository` in `server/src/modules/learning/infrastructure/repositories/learning.repository.ts`
- [x] T008 [P] Create shared TypeScript types for Learning feature in `client/src/modules/learning/types/learning.types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dictionary search infrastructure that MUST be complete before user stories can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Update `IWordReadRepository` interface to add `searchByPrefix(query, top, skip)` and `findSenseById(senseId)` methods in `server/src/modules/dictionary/domain/repositories/word-read.repository.interface.ts`
- [x] T010 Implement `searchByPrefix` in `WordReadRepository` using ILIKE query with `varchar_pattern_ops` index in `server/src/modules/dictionary/infrastructure/repositories/word-read.repository.ts`
- [x] T011 Implement `findSenseById` in `WordReadRepository` with eager loading of word and examples in `server/src/modules/dictionary/infrastructure/repositories/word-read.repository.ts`
- [x] T012 [P] Create `WordSenseSearchResultResponseDto` in `server/src/modules/dictionary/dto/responses/word-sense-search-result.response.dto.ts`
- [x] T013 [P] Create `WordSenseDetailResponseDto` in `server/src/modules/dictionary/dto/responses/word-sense-detail.response.dto.ts`
- [x] T014 [P] Create API service layer for Dictionary in `client/src/modules/learning/services/dictionary.api.ts`
- [x] T015 [P] Create API service layer for Learning in `client/src/modules/learning/services/learning.api.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Search for WordSenses (Priority: P1) 🎯 MVP

**Goal**: Users can search for English words and see all their meanings (senses) with as-you-type debounce

**Independent Test**: Type "book" into search → see noun and verb senses with part of speech, definition, CEFR level

### Backend

- [x] T016 [P] [US1] Create `SearchWordSensesQuery` in `server/src/modules/dictionary/application/queries/search-word-senses.query.ts`
- [x] T017 [US1] Implement `SearchWordSensesHandler` with ILIKE prefix search, pagination, ranking (exact → prefix → frequency) in `server/src/modules/dictionary/application/queries/search-word-senses.handler.ts`
- [x] T018 [US1] Create `DictionaryController` with `GET /api/v1/dictionary/search` endpoint (public, no auth guard) in `server/src/modules/dictionary/controllers/dictionary.controller.ts`
- [x] T019 [US1] Add search query validation (min 1 char, max 100 chars, `$top`/`$skip` params) in `DictionaryController`
- [x] T020 [US1] Register `SearchWordSensesHandler` and `DictionaryController` in `DictionaryModule`

### Frontend

- [x] T021 [P] [US1] Create `useSearchStore` Zustand store for search query state with debounce in `client/src/modules/learning/stores/use-search-store.ts`
- [x] T022 [P] [US1] Create `useSearchWordSenses` TanStack Query hook in `client/src/modules/learning/hooks/use-search-word-senses.ts`
- [x] T023 [US1] Create `SearchInput` component with debounced input (~300ms) in `client/src/modules/learning/components/search-input.tsx`
- [x] T024 [P] [US1] Create `WordSenseCard` component for compact search result display in `client/src/modules/learning/components/word-sense-card.tsx`
- [x] T025 [US1] Create `SearchResultsList` component with pagination in `client/src/modules/learning/components/search-results-list.tsx`
- [x] T026 [US1] Create `DictionarySearchPage` page component in `client/src/modules/learning/pages/dictionary-search.page.tsx`
- [x] T027 [US1] Add `/dictionary` route to TanStack Router configuration

**Checkpoint**: Search is fully functional — users can type and see matching WordSenses

---

## Phase 4: User Story 2 — View WordSense Details (Priority: P1)

**Goal**: Users can tap on a WordSense to see full details (definition, examples, pronunciation, CEFR level, synonyms)

**Independent Test**: Select "book (noun)" from results → see full definition, examples, audio, synonyms

### Backend

- [x] T028 [P] [US2] Create `GetWordSenseDetailQuery` in `server/src/modules/dictionary/application/queries/get-word-sense-detail.query.ts`
- [x] T029 [US2] Implement `GetWordSenseDetailHandler` with full sense data + optional learning state for authenticated users in `server/src/modules/dictionary/application/queries/get-word-sense-detail.handler.ts`
- [x] T030 [US2] Add `GET /api/v1/dictionary/senses/:senseId` endpoint to `DictionaryController` (public, optional auth for learning state)
- [x] T031 [US2] Register `GetWordSenseDetailHandler` in `DictionaryModule`

### Frontend

- [x] T032 [P] [US2] Create `useWordSenseDetail` TanStack Query hook in `client/src/modules/learning/hooks/use-word-sense-detail.ts`
- [x] T033 [US2] Create `WordSenseDetail` component displaying full sense data in `client/src/modules/learning/components/word-sense-detail.tsx`
- [x] T034 [US2] Create `WordSenseDetailPage` page component in `client/src/modules/learning/pages/word-sense-detail.page.tsx`
- [x] T035 [US2] Add `/dictionary/senses/:senseId` route to TanStack Router configuration
- [x] T036 [US2] Link `WordSenseCard` in search results to detail page via navigation

**Checkpoint**: Full view flow works — search → click result → see details

---

## Phase 5: User Story 3 — Add to Learning (Priority: P1)

**Goal**: Users can click "Add to Learning" on a WordSense to start tracking their progress

**Independent Test**: Click "Add to Learning" on a sense → button changes to "Already Learning" → refresh confirms state persisted

### Backend

- [x] T037 [P] [US3] Create `AddToLearningCommand` in `server/src/modules/learning/application/commands/add-to-learning.command.ts`
- [x] T038 [P] [US3] Create `AddToLearningRequestDto` with `wordSenseId` validation in `server/src/modules/learning/dto/requests/add-to-learning.request.dto.ts`
- [x] T039 [US3] Implement `AddToLearningHandler` with idempotent upsert logic (check existing → create or restore archived) in `server/src/modules/learning/application/commands/add-to-learning.handler.ts`
- [x] T040 [US3] Create `LearningController` with `POST /api/v1/learning/senses` endpoint (JwtAuthGuard) in `server/src/modules/learning/controllers/learning.controller.ts`
- [x] T041 [US3] Register `AddToLearningHandler` and `LearningController` in `LearningModule`

### Frontend

- [x] T042 [P] [US3] Create `useAddToLearning` TanStack Query mutation hook in `client/src/modules/learning/hooks/use-add-to-learning.ts`
- [x] T043 [US3] Create `AddToLearningButton` component with "Add" / "Already Learning" states in `client/src/modules/learning/components/add-to-learning-button.tsx`
- [x] T044 [US3] Integrate `AddToLearningButton` into `WordSenseDetail` component
- [x] T045 [US3] Handle unauthenticated user click → redirect to login

**Checkpoint**: Core feature complete — search → view → add to learning works end-to-end

---

## Phase 6: User Story 4 — View Learning List (Priority: P2)

**Goal**: Users can see all WordSenses they've added to their personal learning list

**Independent Test**: Navigate to "My Learning" → see all previously added senses with mastery level

### Backend

- [ ] T046 [P] [US4] Create `GetLearningListQuery` in `server/src/modules/learning/application/queries/get-learning-list.query.ts`
- [ ] T047 [P] [US4] Create `LearningListItemResponseDto` in `server/src/modules/learning/dto/responses/learning-list-item.response.dto.ts`
- [ ] T048 [US4] Implement `GetLearningListHandler` with JOIN to `word_senses`/`words`, filtering `archived_at IS NULL`, pagination in `server/src/modules/learning/application/queries/get-learning-list.handler.ts`
- [ ] T049 [US4] Add `GET /api/v1/learning/senses` endpoint to `LearningController` (JwtAuthGuard)
- [ ] T050 [US4] Register `GetLearningListHandler` in `LearningModule`

### Frontend

- [x] T051 [P] [US4] Create `useLearningList` TanStack Query hook in `client/src/modules/learning/hooks/use-learning-list.ts`
- [x] T052 [US4] Create `LearningList` component with pagination and empty state in `client/src/modules/learning/components/learning-list.tsx`
- [x] T053 [US4] Create `MyLearningPage` page component in `client/src/modules/learning/pages/my-learning.page.tsx`
- [x] T054 [US4] Add `/learning` route to TanStack Router configuration
- [x] T055 [US4] Add navigation link to "My Learning" in app sidebar/header

**Checkpoint**: Learning list is viewable — users can see and browse their learning queue

---

## Phase 7: User Story 5 — Remove from Learning (Priority: P2)

**Goal**: Users can remove a WordSense from their learning list (soft delete) and re-add to restore progress

**Independent Test**: Remove "book (noun)" → disappears from list → re-add → progress restored

### Backend

- [x] T056 [P] [US5] Create `RemoveFromLearningCommand` in `server/src/modules/learning/application/commands/remove-from-learning.command.ts`
- [x] T057 [US5] Implement `RemoveFromLearningHandler` setting `archivedAt = now()` in `server/src/modules/learning/application/commands/remove-from-learning.handler.ts`
- [x] T058 [US5] Add `DELETE /api/v1/learning/senses/:senseId` endpoint to `LearningController`
- [x] T059 [US5] Register `RemoveFromLearningHandler` in `LearningModule`

### Frontend

- [ ] T060 [P] [US5] Create `useRemoveFromLearning` TanStack Query mutation hook in `client/src/modules/learning/hooks/use-remove-from-learning.ts`
- [ ] T061 [US5] Add "Remove" button/action to `LearningList` items
- [ ] T062 [US5] Add confirmation dialog before removal using Shadcn `AlertDialog`
- [ ] T063 [US5] Invalidate learning list and sense detail queries on remove/re-add

**Checkpoint**: Full CRUD lifecycle works — add, view, remove, re-add

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T064 [P] Add OpenAPI/Swagger decorators to all new endpoints in `DictionaryController` and `LearningController`
- [ ] T065 [P] Add rate limiting to `GET /api/v1/dictionary/search` endpoint
- [ ] T066 Run `quickstart.md` validation — verify all curl commands work
- [ ] T067 [P] Add database index for search performance: `CREATE INDEX idx_words_normalized_text_pattern ON words (normalized_text varchar_pattern_ops)`
- [ ] T068 Code review: verify CQRS compliance (commands don't return data, queries don't mutate)
- [ ] T069 Code review: verify all responses use standard envelope from response-schema.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 Search (Phase 3)**: Depends on Phase 2
- **US2 View Details (Phase 4)**: Depends on Phase 2 (can parallel with US1)
- **US3 Add to Learning (Phase 5)**: Depends on Phase 2 (can parallel with US1/US2)
- **US4 View Learning List (Phase 6)**: Depends on US3 (needs progress records to exist)
- **US5 Remove from Learning (Phase 7)**: Depends on US3 + US4
- **Polish (Phase 8)**: Depends on all user stories

### User Story Dependencies

- **US1 (Search)**: Independent after Phase 2
- **US2 (View Details)**: Independent after Phase 2 (but best after US1 for navigation flow)
- **US3 (Add to Learning)**: Independent after Phase 2 (but best after US2 for UI integration)
- **US4 (View Learning List)**: Depends on US3 (needs data to display)
- **US5 (Remove from Learning)**: Depends on US3 + US4

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T005 (ORM entity) || T006 (Repository interface) || T008 (Frontend types)
```

**Phase 2 (Foundational)**:
```
T012 (Search DTO) || T013 (Detail DTO) || T014 (Dict API) || T015 (Learning API)
```

**Phase 3-5 (P1 Stories — after Foundational)**:
```
T016 (Search query) || T021 (Search store) || T022 (Search hook)
T028 (Detail query) || T032 (Detail hook)
T037 (Add command) || T038 (Add DTO) || T042 (Add hook)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: Search (US1)
4. Complete Phase 4: View Details (US2)
5. Complete Phase 5: Add to Learning (US3)
6. **STOP and VALIDATE**: Full search → view → add flow works
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Search) → Test → Deploy (users can browse dictionary)
3. Add US2 (View Details) → Test → Deploy (users can explore senses)
4. Add US3 (Add to Learning) → Test → Deploy (core feature! MVP!)
5. Add US4 (View Learning List) → Test → Deploy (learning management)
6. Add US5 (Remove from Learning) → Test → Deploy (full lifecycle)
7. Polish → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: **69**
