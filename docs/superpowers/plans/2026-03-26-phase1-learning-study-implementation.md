# Phase 1 Learning Study (BE + FE) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Phase 1 study flow so users can start due-card review and topic-based study from `/learning`, complete sessions in `/learning/study`, and submit ratings via the existing review endpoint.

**Architecture:** Add a new read-focused `learning/study` backend module for due/topic card retrieval while keeping all write/FSRS logic in existing `learning/progress` (`POST /learning/senses/:senseId/review`). Extend `topic` repository with one read method for topic words. On frontend, add a dedicated dictionary study route, hooks, API service, and Zustand session store with URL index sync.

**Tech Stack:** NestJS 11 + CQRS + MikroORM + Swagger (server), React 19 + TanStack Router + TanStack Query + Zustand + Tailwind + motion (client).

---

## Scope check

This spec contains tightly-coupled backend + frontend work for one user-facing feature (Phase 1 study flow). It should remain in one plan with backend-first then frontend integration.

## Constraints to preserve

- Reuse existing review endpoint: `POST /learning/senses/:senseId/review`.
- Do not move FSRS logic out of `learning/progress`.
- Keep existing flashcard route `/study` unchanged.
- New dictionary route is `/learning/study`.
- Topic mode includes only words that already have active progress in Phase 1.
- **Do not commit automatically during implementation**; pause for user file review before any commit.

## File structure map (planned changes)

### Backend — new files

- `server/src/modules/learning/study/study.module.ts`
  - Registers query handlers and controller for study retrieval.
- `server/src/modules/learning/study/controllers/study.controller.ts`
  - Exposes `GET /learning/study/due` and `GET /learning/study/topic/:topicId`.
- `server/src/modules/learning/study/application/queries/get-due-cards.query.ts`
- `server/src/modules/learning/study/application/queries/get-due-cards.handler.ts`
- `server/src/modules/learning/study/application/queries/get-topic-cards.query.ts`
- `server/src/modules/learning/study/application/queries/get-topic-cards.handler.ts`
- `server/src/modules/learning/study/dto/responses/study-card.response.dto.ts`
  - DTOs for study card and list envelope (`cards`, `total`, `capped`).

### Backend — modified files

- `server/src/modules/learning/topic/domain/repositories/topic.repository.interface.ts`
  - Add `findWordsByTopic(topicId, tenantId, userId)`.
- `server/src/modules/learning/topic/infrastructure/repositories/topic.repository.ts`
  - Implement `findWordsByTopic` via `TopicWordOrmEntity` + `TopicOrmEntity` scoping.
- `server/src/modules/learning/topic/topic.module.ts`
  - Ensure repository dependencies needed by new method remain satisfied.
- `server/src/modules/learning/progress/progress.module.ts`
  - No write-path changes expected; only verify exports remain compatible.
- `server/src/modules/learning/progress/controllers/learning.controller.ts`
  - No endpoint changes expected; only verify review contract compatibility.
- `server/src/modules/learning/learning.module.ts` or parent wiring module (exact existing integration point)
  - Import/register `StudyModule`.

### Backend — tests (new)

- `server/src/modules/learning/study/application/queries/get-due-cards.handler.spec.ts`
- `server/src/modules/learning/study/application/queries/get-topic-cards.handler.spec.ts`
- `server/src/modules/learning/study/controllers/study.controller.spec.ts`

### Frontend — new files

- `client/src/modules/learning/services/study.api.ts`
- `client/src/modules/learning/types/study.types.ts`
- `client/src/modules/learning/hooks/use-due-cards.ts`
- `client/src/modules/learning/hooks/use-topic-cards.ts`
- `client/src/modules/learning/hooks/use-review-card.ts`
- `client/src/modules/learning/stores/use-study-session-store.ts`
- `client/src/modules/learning/pages/study-session.page.tsx`
- `client/src/modules/learning/components/flashcard-view.tsx`
- `client/src/modules/learning/components/rating-buttons.tsx`
- `client/src/modules/learning/components/study-progress.tsx`
- `client/src/modules/learning/components/session-complete-card.tsx`

### Frontend — modified files

- `client/src/routes.ts`
  - Add route mapping for `/learning/study` to new page.
- `client/src/shared/constants/routes.ts`
  - Add `LEARNING_STUDY: '/learning/study'` constant.
- `client/src/shared/constants/key.ts` (or current query-key file)
  - Add `studyKeys` for due/topic/review invalidation.
- `client/src/modules/learning/pages/my-learning.page.tsx`
  - Add “Start Review” CTA and topic study entry section.
- `client/src/modules/topic/hooks/use-topics.ts`
  - Reuse for topic picker on learning page (no behavior changes expected).

### Frontend — tests

No frontend automated test runner is currently configured in `client/package.json`. For Phase 1, use strict lint/build + manual test script. (If team later adds Vitest, convert manual checks to automated component/store tests.)

---

## Chunk 1: Backend study read APIs

### Task 1: Add topic repository read method for study

**Files:**
- Modify: `server/src/modules/learning/topic/domain/repositories/topic.repository.interface.ts`
- Modify: `server/src/modules/learning/topic/infrastructure/repositories/topic.repository.ts`
- Modify: `server/src/modules/learning/topic/topic.module.ts` (only if provider wiring needed)
- Test: `server/src/modules/learning/topic/infrastructure/repositories/topic.repository.spec.ts` (create if absent)

- [ ] **Step 1: Write failing repository test for findWordsByTopic**

```ts
it('returns topic words scoped by topicId + tenantId + userId', async () => {
  const rows = await repo.findWordsByTopic(topicId, tenantId, userId);
  expect(rows.every((r) => r.wordSenseId)).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npm run test -- topic.repository.spec.ts`
Expected: FAIL with missing method / assertion mismatch.

- [ ] **Step 3: Implement findWordsByTopic in interface and repository**

```ts
findWordsByTopic(topicId: string, tenantId: string, userId: string): Promise<
  Array<{ topicWordId: string; wordSenseId: string; addedAt: Date }>
>;
```

Repository query shape:
- enforce topic ownership (`topic.id`, `topic.tenantId`, `topic.userId`)
- order by `addedAt ASC`
- map to lightweight row DTO

- [ ] **Step 4: Run test to verify pass**

Run: `cd server && npm run test -- topic.repository.spec.ts`
Expected: PASS.

- [ ] **Step 5: Run quick safety checks**

Run: `cd server && npm run lint && npm run build`
Expected: no lint/type errors.

- [ ] **Step 6: Pause for review (no commit yet)**

Prepare file list for user review.

---

### Task 2: Create StudyModule DTOs, queries, handlers, and controller

**Files:**
- Create: `server/src/modules/learning/study/dto/responses/study-card.response.dto.ts`
- Create: `server/src/modules/learning/study/application/queries/get-due-cards.query.ts`
- Create: `server/src/modules/learning/study/application/queries/get-due-cards.handler.ts`
- Create: `server/src/modules/learning/study/application/queries/get-topic-cards.query.ts`
- Create: `server/src/modules/learning/study/application/queries/get-topic-cards.handler.ts`
- Create: `server/src/modules/learning/study/controllers/study.controller.ts`
- Create: `server/src/modules/learning/study/study.module.ts`
- Modify: `server/src/modules/learning/learning.module.ts` (or root module where learning submodules are imported)
- Test: `server/src/modules/learning/study/application/queries/get-due-cards.handler.spec.ts`
- Test: `server/src/modules/learning/study/application/queries/get-topic-cards.handler.spec.ts`
- Test: `server/src/modules/learning/study/controllers/study.controller.spec.ts`

- [ ] **Step 1: Write failing tests for due query behavior**

```ts
it('returns only due, non-archived progress rows with deterministic ordering', async () => {
  // dueDate <= now, archivedAt = null
});

it('deduplicates by wordSenseId and caps at 100', async () => {
  // expect capped=true and total semantics
});
```

- [ ] **Step 2: Run due-query test (expect fail)**

Run: `cd server && npm run test -- get-due-cards.handler.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement due query/handler + DTO mapping**

Minimal mapping rules:
- front = `word.word` + `partOfSpeech`
- back = `{ definition, example }` (first example sentence if present)
- hint = `partOfSpeech`
- due endpoint filter: `dueDate <= now`, `archivedAt IS NULL`
- `total` = post-exclusion + post-dedup + pre-cap count

- [ ] **Step 4: Write failing tests for topic query behavior**

```ts
it('uses topicRepo.findWordsByTopic and includes only active progress rows', async () => {
  // no implicit progress creation
});

it('does not apply due filter in topic mode', async () => {
  // returns progress rows regardless of due status
});
```

- [ ] **Step 5: Run topic-query test (expect fail)**

Run: `cd server && npm run test -- get-topic-cards.handler.spec.ts`
Expected: FAIL.

- [ ] **Step 6: Implement topic query/handler**

Rules:
- source rows from `findWordsByTopic`
- join progress by `wordSenseId` + user/tenant + `archivedAt IS NULL`
- skip malformed content rows
- dedup by `wordSenseId`
- order by `addedAt ASC, wordSenseId ASC`
- cap to 100 and set `capped`

- [ ] **Step 7: Write failing controller tests**

```ts
it('GET /learning/study/due returns ApiResponse.success payload', async () => {});
it('GET /learning/study/topic/:topicId validates uuid and returns 400 for malformed id', async () => {});
```

- [ ] **Step 8: Run controller test (expect fail)**

Run: `cd server && npm run test -- study.controller.spec.ts`
Expected: FAIL.

- [ ] **Step 9: Implement controller + module wiring**

Endpoints:
- `GET /learning/study/due`
- `GET /learning/study/topic/:topicId`

Security:
- `JwtAuthGuard`
- `@CurrentUser()` user scope

- [ ] **Step 10: Run target tests to green**

Run:
- `cd server && npm run test -- get-due-cards.handler.spec.ts`
- `cd server && npm run test -- get-topic-cards.handler.spec.ts`
- `cd server && npm run test -- study.controller.spec.ts`

Expected: PASS.

- [ ] **Step 11: Run module-level verification**

Run: `cd server && npm run lint && npm run build`
Expected: no lint/type errors.

- [ ] **Step 12: Pause for review (no commit yet)**

Share updated backend file list and diff summary.

---

## Chunk 2: Frontend study experience

### Task 3: Add study API, types, hooks, and query keys

**Files:**
- Create: `client/src/modules/learning/types/study.types.ts`
- Create: `client/src/modules/learning/services/study.api.ts`
- Create: `client/src/modules/learning/hooks/use-due-cards.ts`
- Create: `client/src/modules/learning/hooks/use-topic-cards.ts`
- Create: `client/src/modules/learning/hooks/use-review-card.ts`
- Modify: `client/src/shared/constants/key.ts`

- [ ] **Step 1: Add TS types from backend contract**

```ts
export interface StudyCard {
  wordSenseId: string;
  front: string;
  back: { definition: string; example: string | null };
  hint: string;
  dueDate: string | null;
  isDue: boolean;
  isMastered: boolean;
  masteryLevel: 0|1|2|3|4|5;
}
```

- [ ] **Step 2: Implement study API client**

Methods:
- `getDueCards()` -> `/learning/study/due`
- `getTopicCards(topicId)` -> `/learning/study/topic/${topicId}`
- `reviewCard({ senseId, rating, reviewDurationMs })` -> `/learning/senses/${senseId}/review`

- [ ] **Step 3: Add query keys + hooks**

`studyKeys`:
- `studyKeys.due()`
- `studyKeys.topic(topicId)`
- `studyKeys.review()`

Hooks:
- `useDueCards`
- `useTopicCards`
- `useReviewCard` with invalidation policy from spec.

- [ ] **Step 4: Run client lint to verify types/imports**

Run: `cd client && npm run lint`
Expected: PASS.

- [ ] **Step 5: Pause for review (no commit yet)**

Share new API/hook files.

---

### Task 4: Build study session store + UI route + components

**Files:**
- Create: `client/src/modules/learning/stores/use-study-session-store.ts`
- Create: `client/src/modules/learning/components/study-progress.tsx`
- Create: `client/src/modules/learning/components/flashcard-view.tsx`
- Create: `client/src/modules/learning/components/rating-buttons.tsx`
- Create: `client/src/modules/learning/components/session-complete-card.tsx`
- Create: `client/src/modules/learning/pages/study-session.page.tsx`
- Modify: `client/src/routes.ts`
- Modify: `client/src/shared/constants/routes.ts`

- [ ] **Step 1: Implement Zustand store with URL-sync-safe state**

State:
- `cards`, `currentIndex`, `flipped`, `sessionMode`, `topicId`
- `reviewedCount`, `correctLikeCount`, `startedAt`, `isSubmittingRating`

Actions:
- `startSession`, `setIndex`, `flipCard`, `recordRating`, `setSubmittingRating`, `goNext`, `finishSession`, `resetSession`

- [ ] **Step 2: Implement stateless components (progress/flashcard/rating/complete)**

Keep components focused:
- `study-progress.tsx` only presentation
- `rating-buttons.tsx` handles disabled state + key labels
- `flashcard-view.tsx` handles flip animation and render only

- [ ] **Step 3: Implement `/learning/study` page orchestration**

Behavior:
- parse query params: `mode`, `topicId`, `index`
- fetch cards via proper hook
- hydrate store once data loaded
- clamp invalid index
- keyboard shortcuts: Space flip, 1..4 rating
- on rate: compute `reviewDurationMs`, call mutation, show feedback (~800ms), auto-advance

- [ ] **Step 4: Add route and route constant wiring**

- add route entry in `client/src/routes.ts`
- add `APP_ROUTES.LEARNING_STUDY`

- [ ] **Step 5: Run client lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 6: Pause for review (no commit yet)**

Share new study page/store/components diff.

---

### Task 5: Enhance `/learning` page with study entry points

**Files:**
- Modify: `client/src/modules/learning/pages/my-learning.page.tsx`
- Modify: `client/src/modules/learning/components/learning-list.tsx` (if needed for due summary)
- Reuse: `client/src/modules/topic/hooks/use-topics.ts`

- [ ] **Step 1: Add Start Review CTA section**

- Show due count from `useDueCards` (lightweight count usage)
- Button navigates to `/learning/study?mode=due&index=0`

- [ ] **Step 2: Add Study by Topic section**

- Load first page of topics via existing `useTopics`
- Render topic list with “Study” action
- Navigate to `/learning/study?mode=topic&topicId=<id>&index=0`

- [ ] **Step 3: Add empty states**

- no due cards -> contextual message
- no studyable topic cards -> guided message to add/start learning first

- [ ] **Step 4: Run client lint/build**

Run: `cd client && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 5: Pause for review (no commit yet)**

Share `/learning` page updates.

---

## Chunk 3: End-to-end verification and handoff

### Task 6: Full-system verification against spec acceptance criteria

**Files:**
- Modify: none expected (verification task)
- Output artifact: verification notes in PR/task comment

- [ ] **Step 1: Backend verification commands**

Run:
- `cd server && npm run test -- get-due-cards.handler.spec.ts`
- `cd server && npm run test -- get-topic-cards.handler.spec.ts`
- `cd server && npm run test -- study.controller.spec.ts`
- `cd server && npm run lint`
- `cd server && npm run build`

Expected: all pass.

- [ ] **Step 2: Frontend verification commands**

Run:
- `cd client && npm run lint`
- `cd client && npm run build`

Expected: pass.

- [ ] **Step 3: Manual acceptance script**

1. Login and open `/learning`.
2. Confirm Start Review due count displays.
3. Start due review -> `/learning/study?mode=due&index=0`.
4. Flip with Space; rate with keys 1..4.
5. Confirm auto-advance and disabled buttons while submitting.
6. Open topic mode from `/learning`; verify topic navigation.
7. Confirm malformed topic id route fallback behavior.
8. Confirm existing `/study` flashcard route remains unchanged.

- [ ] **Step 4: API sanity checks (optional via Swagger/curl)**

- `GET /v1/learning/study/due`
- `GET /v1/learning/study/topic/{topicId}`
- `POST /v1/learning/senses/{senseId}/review`

- [ ] **Step 5: Final review package (no commit)**

Prepare:
- changed files list
- test/lint/build output snippets
- known limitations (no frontend automated tests yet)

- [ ] **Step 6: User sign-off gate**

Ask user to review all modified files before any commit.

---

## Definition of Done

- Backend has new `learning/study` module with due/topic read endpoints.
- Topic repository exposes `findWordsByTopic` and is consumed by study handlers.
- Existing review endpoint is reused unchanged in ownership (`learning/progress`).
- Frontend has `/learning/study` route with functional session UX.
- `/learning` page provides Start Review and Study by Topic entry points.
- Lint/build pass for both server and client.
- Manual acceptance script passes.
- User has reviewed files before any commit.

---

## Plan execution notes

- Use @superpowers:test-driven-development during implementation of each task.
- Use @superpowers:verification-before-completion before claiming each chunk done.
- Use @superpowers:requesting-code-review after each major chunk.
- Keep changes small and reviewable; stop after each task for checkpoint review.

