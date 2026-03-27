# Phase 2 Study Session Tracking + Analytics Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist study session lifecycle (start/review/complete/summary) while preserving existing FSRS review behavior and upgrading the study UI to URL-resilient session summaries.

**Architecture:** Add session persistence (`StudySession`, `StudyReviewLog`) inside `learning/study`, keep `learning/progress` as canonical FSRS write path, and orchestrate session-aware reviews via CQRS handlers + event payload enrichment. Frontend keeps inline study UX but becomes server-session-driven (`sessionId`) with URL-synced resume/summary behavior.

**Tech Stack:** NestJS 11 (CQRS, EventEmitter, MikroORM, Swagger), PostgreSQL migrations, React 19 + TanStack Router/Query, Zustand, TypeScript.

---

## File Structure (planned changes)

### Backend

- Create: `server/src/modules/learning/study/infrastructure/persistence/study-session.orm-entity.ts`
  - `StudySession` persistence model (scope, studyType, enrolledCardIds, counters, status, timestamps)
- Create: `server/src/modules/learning/study/infrastructure/persistence/study-review-log.orm-entity.ts`
  - `StudyReviewLog` persistence model with unique `(sessionId, wordSenseId)`
- Create: `server/src/modules/learning/study/domain/entities/study-session.entity.ts`
- Create: `server/src/modules/learning/study/domain/entities/study-review-log.entity.ts`
- Create: `server/src/modules/learning/study/domain/events/study-session-started.event.ts`
- Create: `server/src/modules/learning/study/domain/events/study-session-completed.event.ts`
- Create: `server/src/modules/learning/study/dto/requests/start-study-session.request.dto.ts`
- Create: `server/src/modules/learning/study/dto/requests/study-session-review.request.dto.ts`
- Create: `server/src/modules/learning/study/dto/requests/complete-study-session.request.dto.ts`
- Create: `server/src/modules/learning/study/dto/responses/session-summary.response.dto.ts`
- Create: `server/src/modules/learning/study/application/commands/start-study-session.command.ts`
- Create: `server/src/modules/learning/study/application/commands/start-study-session.handler.ts`
- Create: `server/src/modules/learning/study/application/commands/study-session-review.command.ts`
- Create: `server/src/modules/learning/study/application/commands/study-session-review.handler.ts`
- Create: `server/src/modules/learning/study/application/commands/complete-study-session.command.ts`
- Create: `server/src/modules/learning/study/application/commands/complete-study-session.handler.ts`
- Create: `server/src/modules/learning/study/application/queries/get-session-summary.query.ts`
- Create: `server/src/modules/learning/study/application/queries/get-session-summary.handler.ts`
- Create: `server/src/modules/learning/study/controllers/study-session.controller.ts`
- Create: `server/src/modules/learning/study/infrastructure/repositories/study-session.repository.ts`
- Create: `server/src/modules/learning/study/listeners/study-session-review-log.listener.ts`
- Modify: `server/src/modules/learning/progress/application/commands/review-word.command.ts`
  - add optional `sessionId?: string`
- Modify: `server/src/modules/learning/progress/domain/events/word-reviewed.event.ts`
  - add optional `sessionId?: string` in payload/event
- Modify: `server/src/modules/learning/progress/application/commands/review-word.handler.ts`
  - pass `sessionId` into emitted event payload
- Modify: `server/src/modules/learning/study/study.module.ts`
  - register command/query handlers, listener, new entities, `ProgressModule`
- Create: `server/src/migrations/Migration<timestamp>_phase2_study_session_tracking.ts`

### Frontend

- Modify: `client/src/modules/learning/types/study.types.ts`
  - add start/review/complete/summary payload+response types
- Modify: `client/src/modules/learning/services/study.api.ts`
  - add `startSession`, `reviewCard`(session endpoint), `completeSession`, `getSessionSummary`
- Create: `client/src/modules/learning/hooks/use-start-session.ts`
- Modify: `client/src/modules/learning/hooks/use-review-card.ts`
- Create: `client/src/modules/learning/hooks/use-complete-session.ts`
- Create: `client/src/modules/learning/hooks/use-session-summary.ts`
- Modify: `client/src/modules/learning/stores/use-study-session-store.ts`
  - add `sessionId`, `completed`, `ratingBreakdown` (derive correct answers from breakdown; no duplicate `correctCount` state)
- Modify: `client/src/modules/learning/pages/study-session.page.tsx`
  - server session startup, URL sync, resume branches
- Modify: `client/src/modules/learning/components/session-complete-card.tsx`
  - server summary rendering + fallback
- Modify: `client/src/shared/constants/key.ts`
  - add session query keys

### Tests / Verification

- Create: `server/src/modules/learning/study/application/commands/start-study-session.handler.spec.ts`
- Create: `server/src/modules/learning/study/application/commands/study-session-review.handler.spec.ts`
- Create: `server/src/modules/learning/study/application/commands/complete-study-session.handler.spec.ts`
- Create: `server/src/modules/learning/study/application/queries/get-session-summary.handler.spec.ts`
- Modify: `server/src/modules/learning/progress/application/commands/review-word.handler.spec.ts`
  - optional `sessionId` propagation test

---

## Chunk 1: Backend session persistence + CQRS write path

### Task 1: Add persistence models and migration

**Files:**
- Create: `server/src/modules/learning/study/infrastructure/persistence/study-session.orm-entity.ts`
- Create: `server/src/modules/learning/study/infrastructure/persistence/study-review-log.orm-entity.ts`
- Create: `server/src/migrations/Migration<timestamp>_phase2_study_session_tracking.ts`

- [ ] **Step 1: Run impact analysis for edited symbols (GitNexus)**

Run GitNexus MCP calls for new integration points:
- `gitnexus_impact({ target: "StudyModule", direction: "upstream" })`
- `gitnexus_impact({ target: "ReviewWordHandler", direction: "upstream" })`

Expected: risk summary captured; if HIGH/CRITICAL, pause and confirm before edits.

- [ ] **Step 2: Write failing ORM-focused tests for constraints**

Create specs asserting:
- `StudySession` defaults (`status=IN_PROGRESS`, counters `0`)
- `StudyReviewLog` unique `(sessionId, wordSenseId)`

Run: `npm run test -- study-session-review.handler.spec.ts -t "duplicate review"`
Expected: FAIL (entity/repo not implemented yet).

- [ ] **Step 3: Implement ORM entities and migration (minimal)**

Implement:
- `StudySessionOrmEntity` with `enrolledCardIds: string[]`, `studyType`, `scope`, `status`, counters, timestamps (default `status='IN_PROGRESS'`)
- `StudyReviewLogOrmEntity` with FK `session`, `wordSenseId`, `rating`, `reviewDurationMs`, `reviewedAt`, unique constraint
- migration creating both tables + indexes (`userId`, `tenantId`, `sessionId`) and status constraint covering `IN_PROGRESS|COMPLETED|ABANDONED`

- [ ] **Step 4: Run tests + migration sanity check**

Run:
- `npm run test -- study-session-review.handler.spec.ts -t "duplicate review"`
- `npm run migration:up`

Expected: test passes; migration applies successfully.

- [ ] **Step 5: Commit chunk**

Pre-commit scope check:
- `gitnexus_detect_changes({ scope: "staged" })`

Commit:
```bash
git add server/src/modules/learning/study/infrastructure/persistence/study-session.orm-entity.ts server/src/modules/learning/study/infrastructure/persistence/study-review-log.orm-entity.ts server/src/migrations/Migration*_phase2_study_session_tracking.ts
git commit -m "feat(study): add session and review log persistence"
```

### Task 2: Implement session start/review/complete commands

**Files:**
- Create: `server/src/modules/learning/study/application/commands/start-study-session.command.ts`
- Create: `server/src/modules/learning/study/application/commands/start-study-session.handler.ts`
- Create: `server/src/modules/learning/study/application/commands/study-session-review.command.ts`
- Create: `server/src/modules/learning/study/application/commands/study-session-review.handler.ts`
- Create: `server/src/modules/learning/study/application/commands/complete-study-session.command.ts`
- Create: `server/src/modules/learning/study/application/commands/complete-study-session.handler.ts`
- Create: `server/src/modules/learning/study/infrastructure/repositories/study-session.repository.ts`
- Create: `server/src/modules/learning/study/domain/entities/study-session.entity.ts`
- Create: `server/src/modules/learning/study/domain/entities/study-review-log.entity.ts`
- Create: `server/src/modules/learning/study/domain/events/study-session-started.event.ts`
- Create: `server/src/modules/learning/study/domain/events/study-session-completed.event.ts`

- [ ] **Step 1: Write failing command handler tests first (@superpowers:test-driven-development)**

Add tests for:
- start command returns `{ sessionId, cards }` and persists enrolled IDs
- review command rejects non-enrolled card (`400`)
- complete command sets `completedAt` and `status=COMPLETED`

Run: `npm run test -- start-study-session.handler.spec.ts study-session-review.handler.spec.ts complete-study-session.handler.spec.ts`
Expected: FAIL.

- [ ] **Step 2: Implement command DTOs + handlers minimally**

Implement handlers:
- Verify existing query contracts first (`GetDueCardsQuery`/`GetTopicCardsQuery` existence, response envelope shape, auth assumptions)
- Start: reuse `GetDueCardsQuery`/`GetTopicCardsQuery` via `QueryBus`, persist session
- Review: validate session ownership/status/membership, dispatch `ReviewWordCommand`
- Complete: mark session completed and emit event

- [ ] **Step 3: Add duplicate review protection (`409`)**

In review handler/repository path:
- rely on DB unique constraint
- translate unique violation to `ConflictException`

- [ ] **Step 4: Run command tests again**

Run: `npm run test -- start-study-session.handler.spec.ts study-session-review.handler.spec.ts complete-study-session.handler.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit chunk**

Pre-commit scope check:
- `gitnexus_detect_changes({ scope: "staged" })`

Commit:
```bash
git add server/src/modules/learning/study/application/commands server/src/modules/learning/study/infrastructure/repositories/study-session.repository.ts server/src/modules/learning/study/domain/entities server/src/modules/learning/study/domain/events
git commit -m "feat(study): add session lifecycle command handlers"
```

### Task 3: Propagate `sessionId` through review event + create review-log listener

**Files:**
- Modify: `server/src/modules/learning/progress/application/commands/review-word.command.ts`
- Modify: `server/src/modules/learning/progress/domain/events/word-reviewed.event.ts`
- Modify: `server/src/modules/learning/progress/application/commands/review-word.handler.ts`
- Create: `server/src/modules/learning/study/listeners/study-session-review-log.listener.ts`

- [ ] **Step 1: Run impact analysis before editing progress symbols**

Run:
- `gitnexus_impact({ target: "ReviewWordCommand", direction: "upstream" })`
- `gitnexus_impact({ target: "WordReviewedEvent", direction: "upstream" })`
- `gitnexus_impact({ target: "ReviewWordHandler", direction: "upstream" })`

Expected: list of affected callers/tests captured and used to update all d=1 dependents.

- [ ] **Step 2: Write failing tests for optional `sessionId` propagation**

Add/extend test to assert:
- existing callers still work without `sessionId`
- when provided, `WordReviewedEvent` includes `sessionId`

Run: `npm run test -- review-word.handler.spec.ts -t "sessionId"`
Expected: FAIL.

- [ ] **Step 3: Implement `sessionId` propagation (no new side effects yet)**

- add optional `sessionId?: string` to command/event payload
- pass it from review handler to event constructor

- [ ] **Step 4: Implement review-log listener side effect**

- implement listener to create `StudyReviewLog` on `WordReviewedEvent`

- [ ] **Step 5: Run focused tests**

Run:
- `npm run test -- review-word.handler.spec.ts`
- `npm run test -- study-session-review.handler.spec.ts`

Expected: PASS.

- [ ] **Step 6: Commit chunk**

Pre-commit scope check:
- `gitnexus_detect_changes({ scope: "staged" })`

Commit:
```bash
git add server/src/modules/learning/progress/application/commands/review-word.command.ts server/src/modules/learning/progress/domain/events/word-reviewed.event.ts server/src/modules/learning/progress/application/commands/review-word.handler.ts server/src/modules/learning/study/listeners/study-session-review-log.listener.ts server/src/modules/learning/progress/application/commands/review-word.handler.spec.ts
git commit -m "feat(study): track session context in review events"
```

---

## Chunk 2: Backend read API + module/controller integration

### Task 4: Implement session summary query and DTOs

**Files:**
- Create: `server/src/modules/learning/study/application/queries/get-session-summary.query.ts`
- Create: `server/src/modules/learning/study/application/queries/get-session-summary.handler.ts`
- Create: `server/src/modules/learning/study/dto/responses/session-summary.response.dto.ts`

- [ ] **Step 1: Write failing summary query tests**

Test cases:
- computes rating breakdown from logs
- computes `accuracy` rounded to 1 decimal
- computes `timeSpentMs`
- ownership guard (`404`)

Run: `npm run test -- get-session-summary.handler.spec.ts`
Expected: FAIL.

- [ ] **Step 2: Implement minimal query + DTO**

Implement:
- load session + logs
- compute fields per spec (`accuracy = Math.round(raw*1000)/10`)
- return DTO

- [ ] **Step 3: Run tests**

Run: `npm run test -- get-session-summary.handler.spec.ts`
Expected: PASS.

- [ ] **Step 4: Commit chunk**

Pre-commit scope check:
- `gitnexus_detect_changes({ scope: "staged" })`

Commit:
```bash
git add server/src/modules/learning/study/application/queries/get-session-summary.query.ts server/src/modules/learning/study/application/queries/get-session-summary.handler.ts server/src/modules/learning/study/dto/responses/session-summary.response.dto.ts server/src/modules/learning/study/application/queries/get-session-summary.handler.spec.ts
git commit -m "feat(study): add session summary query"
```

### Task 5: Expose new session endpoints and wire module providers

**Files:**
- Create: `server/src/modules/learning/study/controllers/study-session.controller.ts`
- Create: `server/src/modules/learning/study/dto/requests/start-study-session.request.dto.ts`
- Create: `server/src/modules/learning/study/dto/requests/study-session-review.request.dto.ts`
- Create: `server/src/modules/learning/study/dto/requests/complete-study-session.request.dto.ts`
- Modify: `server/src/modules/learning/study/study.module.ts`

- [ ] **Step 1: Write failing controller tests (or e2e smoke if unit harness unavailable)**

Cover:
- `POST /learning/study/session/start`
- `POST /learning/study/session/review`
- `POST /learning/study/session/complete`
- `GET /learning/study/session/:id`

Run: `npm run test -- study-session.controller.spec.ts`
Expected: FAIL.

- [ ] **Step 2: Implement controller + module wiring**

- add guarded controller under existing `learning/study` path
- dispatch command/query bus for all endpoints
- register all command/query handlers + listener + entities in `StudyModule`
- import `ProgressModule` in `StudyModule`

- [ ] **Step 3: Run server verification suite**

Run:
- `npm run test -- study-session.controller.spec.ts`
- `npm run build`
- `npm run lint`

Expected: targeted tests pass; build succeeds; lint has no new errors in touched files.

- [ ] **Step 4: Commit chunk**

Pre-commit scope check:
- `gitnexus_detect_changes({ scope: "staged" })`

Commit:
```bash
git add server/src/modules/learning/study/controllers/study-session.controller.ts server/src/modules/learning/study/dto/requests server/src/modules/learning/study/study.module.ts
git commit -m "feat(study): expose session tracking endpoints"
```

---

## Chunk 3: Frontend session flow + URL resumption + summary UI

### Task 6: Add session-capable API/types/hooks

**Files:**
- Modify: `client/src/modules/learning/types/study.types.ts`
- Modify: `client/src/modules/learning/services/study.api.ts`
- Create: `client/src/modules/learning/hooks/use-start-session.ts`
- Modify: `client/src/modules/learning/hooks/use-review-card.ts`
- Create: `client/src/modules/learning/hooks/use-complete-session.ts`
- Create: `client/src/modules/learning/hooks/use-session-summary.ts`
- Modify: `client/src/shared/constants/key.ts`

- [ ] **Step 1: Add failing type-level expectations**

Add TypeScript-level compile checks in hooks (payload includes `sessionId` for review).

Run: `npm run build`
Expected: FAIL with missing types/hook signatures.

- [ ] **Step 2: Implement minimal type/api/hook changes**

- add start/review/complete/summary payload types
- move review mutation to `/learning/study/session/review`
- keep `getDueCards`/`getTopicCards` for start-session card sourcing compatibility

- [ ] **Step 3: Verify build/lint**

Run:
- `npm run build`
- `npm run lint`

Expected: build succeeds; no new lint errors in changed learning files.

- [ ] **Step 4: Commit chunk**

Pre-commit scope check:
- `gitnexus_detect_changes({ scope: "staged" })`

Commit:
```bash
git add client/src/modules/learning/types/study.types.ts client/src/modules/learning/services/study.api.ts client/src/modules/learning/hooks/use-start-session.ts client/src/modules/learning/hooks/use-review-card.ts client/src/modules/learning/hooks/use-complete-session.ts client/src/modules/learning/hooks/use-session-summary.ts client/src/shared/constants/key.ts
git commit -m "feat(learning): add session-tracking study API hooks"
```

### Task 7: Update Zustand store and study session page flow

**Files:**
- Modify: `client/src/modules/learning/stores/use-study-session-store.ts`
- Modify: `client/src/modules/learning/pages/study-session.page.tsx`

- [ ] **Step 1: Write failing behavioral checks (manual test script + assertions in comments)**

Manual script:
1. Start due session → URL contains `sessionId`
2. Refresh mid-session → resume prompt appears
3. Completed session without `completed=true` → URL auto-normalizes to summary

Run: `npm run dev` and execute script.
Expected initially: one or more steps fail.

- [ ] **Step 2: Implement minimal flow**

Store updates:
- add `sessionId`, `completed`, `ratingBreakdown`
- derive correct-answer count from `ratingBreakdown.good + ratingBreakdown.easy` (no separate `correctCount` store field)
- explicit mapping `1→again`, `2→hard`, `3→good`, `4→easy`

Page updates:
- on entry, call `useStartSession` when no `sessionId`
- when `sessionId` present, branch by session status (IN_PROGRESS/COMPLETED/ABANDONED)
- on `ABANDONED`, redirect to `/learning` immediately (no resume flow)
- on complete, call `useCompleteSession` and set `completed=true`

- [ ] **Step 3: Re-run manual checks + build/lint**

Run:
- `npm run dev` (manual flow)
- `npm run build`
- `npm run lint`

Expected: all 3 manual checks pass; build/lint pass (or only pre-existing unrelated warnings).

- [ ] **Step 4: Commit chunk**

Pre-commit scope check:
- `gitnexus_detect_changes({ scope: "staged" })`

Commit:
```bash
git add client/src/modules/learning/stores/use-study-session-store.ts client/src/modules/learning/pages/study-session.page.tsx
git commit -m "feat(learning): add URL-resilient session study flow"
```

### Task 8: Upgrade summary component to server-first data

**Files:**
- Modify: `client/src/modules/learning/components/session-complete-card.tsx`
- (If needed) Modify: `client/src/modules/learning/pages/study-session.page.tsx`

- [ ] **Step 1: Write failing rendering check**

Check that summary shows:
- reviewed count
- accuracy (1 decimal)
- time spent
- Again/Hard/Good/Easy

Expected initially: missing server summary fields.

- [ ] **Step 2: Implement server-first summary rendering**

- use `useSessionSummary(sessionId)` as primary source
- fallback to store counters if fetch fails
- keep “Back to Learning” action

- [ ] **Step 3: Verify UI and compile**

Run:
- `npm run build`
- `npm run lint`

Expected: component compiles and renders without runtime errors.

- [ ] **Step 4: Commit chunk**

Pre-commit scope check:
- `gitnexus_detect_changes({ scope: "staged" })`

Commit:
```bash
git add client/src/modules/learning/components/session-complete-card.tsx client/src/modules/learning/pages/study-session.page.tsx
git commit -m "feat(learning): render server-backed study summary"
```

---

## Final verification and handoff

### Task 9: End-to-end verification + safety checks

**Files:**
- Modify: none (verification only)

- [ ] **Step 1: Run full backend checks**

Run:
- `cd server && npm run test`
- `cd server && npm run build`
- `cd server && npm run lint`

Expected: tests/build pass; no new lint errors from touched files.

- [ ] **Step 2: Run frontend checks**

Run:
- `cd client && npm run build`
- `cd client && npm run lint`

Expected: build passes; no new lint errors from touched files.

- [ ] **Step 3: Run GitNexus final scope verification (required)**

Run:
- `gitnexus_detect_changes({ scope: "all" })`

Expected: changed symbols/execution flows match Phase 2 plan only.

- [ ] **Step 4: Summarize manual QA evidence**

Capture outcomes for:
- Start session (due/topic)
- Review with sessionId
- Duplicate review returns `409`
- Complete session transitions URL to `completed=true`
- Refresh behavior for IN_PROGRESS/COMPLETED/ABANDONED

- [ ] **Step 5: Final commit and optional squash strategy**

If keeping atomic commits: no action.
If project prefers single feature commit: create squash commit after review approval.

---

## Notes for executor

- Keep existing `POST /learning/senses/:id/review` behavior unchanged for non-session callers.
- Do not remove Phase 1 endpoints (`GET /learning/study/due`, `GET /learning/study/topic/:topicId`).
- Any HIGH/CRITICAL GitNexus impact result requires user confirmation before proceeding.
- After final commit, re-index GitNexus if needed: `npx gitnexus analyze` (or `--embeddings` when applicable).
