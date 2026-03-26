# Phase 1 Learning Study Design

Date: 2026-03-26
Status: Draft (validated with user)
Scope: Phase 1 only

## 1. Context

Current backend modules under `learning/`:
- `topic/` (Topic aggregate + TopicWord mapping Topic -> WordSense)
- `progress/` (UserWordSenseProgress as FSRS source of truth)

Goal of this design is to introduce a new `study/` module that orchestrates study-session retrieval without moving existing domain logic out of `topic` or `progress`.

## 2. Confirmed Product Decisions

- Study card content source: **WordSense directly** (not Flashcard)
- Session entry modes: **both supported**
  - Start Review = all due cards
  - Study by Topic = topic-scoped cards with existing active progress in Phase 1 (no auto-create-progress)
- Review pacing: after rating, show brief feedback then auto-advance
- Card structure:
  - Front: headword (+ small part of speech)
  - Back: primary definition + one example sentence
  - Hint: part of speech
- Granularity: **one WordSense = one card**
- Session state: Zustand store + URL sync (`index`)
- Review API: **reuse existing endpoint** (no duplicate review endpoint)
- Study data retrieval: handled by new study query handlers
- Topic integration: through `ITopicRepository` extension (`findWordsByTopic`)
- FSRS scheduling: reuse existing `FsrsSchedulerService` from `learning/progress`
- Session-level analytics events: deferred to Phase 2
- Frontend route: new `/learning/study` route (do not repurpose existing `/study` flashcard route)

## 3. Architecture

### 3.1 Backend module layout

```text
server/src/modules/learning/study/
├── application/
│   └── queries/
│       ├── get-due-cards.query.ts
│       ├── get-due-cards.handler.ts
│       ├── get-topic-cards.query.ts
│       └── get-topic-cards.handler.ts
├── controllers/
│   └── study.controller.ts
└── study.module.ts
```

Notes:
- `study/` is **read orchestration** for Phase 1.
- All review writes remain in existing `learning/progress` command path.
- Domain layer stays minimal (no duplicated FSRS domain model).

### 3.2 API surface (Phase 1)

- `GET /learning/study/due`
  - Return due cards for current user + tenant
- `GET /learning/study/topic/:topicId`
  - Return all topic cards with existing active progress in Phase 1 (not filtered by due status)
- `POST /learning/review` (existing endpoint in progress controller)
  - Reused for applying rating and updating FSRS

### 3.3 Topic repository extension

Extend `ITopicRepository` with:

```ts
findWordsByTopic(topicId: string, tenantId: string, userId: string): Promise<Array<{
  topicWordId: string;
  wordSenseId: string;
  addedAt: Date;
}>>
```

Rationale:
- Keeps study module from querying topic persistence internals directly.
- Preserves topic module ownership of topic-word retrieval semantics.

## 4. CQRS Design

### 4.1 Queries

#### GetDueCardsQuery
Input:
- `userId: string`
- `tenantId: string`

Behavior:
1. Read `UserWordSenseProgress` records where:
   - `userId`/`tenantId` match
   - `archivedAt IS NULL`
   - `dueDate <= now`
2. Join `WordSense` content by `wordSenseId`
3. Exclude malformed/missing content cards (log warning)
4. Map to `StudyCardDto`
5. Deduplicate by `wordSenseId` (keep earliest due record if duplicates appear)
6. Sort by `dueDate ASC, wordSenseId ASC`
7. Limit to max 100 cards per request (Phase 1 bound)

#### GetTopicCardsQuery
Input:
- `userId: string`
- `tenantId: string`
- `topicId: string`

Behavior:
1. Call `topicRepo.findWordsByTopic(topicId, tenantId, userId)`
2. Read progress for returned `wordSenseId[]`
3. Join `WordSense` content
4. For Phase 1, include only cards with existing active progress records (`archivedAt IS NULL`)
   - Return all such cards regardless of due status (no `dueDate <= now` filter in topic mode)
   - (No implicit progress creation in this query)
5. Exclude malformed/missing content cards (log warning)
6. Deduplicate by `wordSenseId` (keep earliest `addedAt` record if duplicates appear)
7. Sort by `addedAt ASC, wordSenseId ASC`
8. Limit to max 100 cards per request (Phase 1 bound)

> Note: This keeps retrieval consistent with existing `POST /learning/review` behavior that expects progress to already exist.

### 4.2 Review command path (existing)

No new review command is introduced in `study/` for Phase 1.

Review write path remains:
- `POST /learning/review`
- Existing `ReviewWordCommand` / `ReviewWordHandler` in `learning/progress`

This avoids duplicated orchestration and keeps single ownership of FSRS updates.

## 5. DTO Contracts

### 5.1 StudyCardDto

```ts
interface StudyCardDto {
  wordSenseId: string;
  front: string; // headword (+ pos label in UI)
  back: {
    definition: string;
    example: string | null;
  };
  hint: string; // part of speech
  dueDate: string | null;
  isDue: boolean;
  isMastered: boolean;
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5;
}
```

`masteryLevel` is derived from existing FSRS/progress mapping with range `0..5`.

Retrieval semantics:
- `dueDate` is current scheduled due date used for ordering/filtering retrieval endpoints.
- `nextDueDate` is only returned by `POST /learning/review` mutation response.

Example response contracts:
- `GET /learning/study/due` -> `{ "cards": StudyCardDto[], "total": number, "capped": boolean }`
- `GET /learning/study/topic/:topicId` -> `{ "cards": StudyCardDto[], "total": number, "capped": boolean, "topicId": "uuid" }`

`total` represents the count after malformed-card exclusion and deduplication, but before applying the 100-card cap. `cards.length` is the returned count after cap.

`capped = true` when the 100-card Phase 1 cap truncates results.

### 5.2 Reused review endpoint contract

Request (`POST /learning/review`):

```json
{
  "wordSenseId": "uuid",
  "rating": 1,
  "reviewDurationMs": 3200
}
```

Rules:
- `wordSenseId`: required UUID
- `rating`: required, one of `1 | 2 | 3 | 4`
- `reviewDurationMs`: required, integer `>= 0`

Response:

```json
{
  "wordSenseId": "uuid",
  "nextDueDate": "2026-03-28T10:00:00.000Z",
  "intervalDays": 2,
  "isDue": false,
  "isMastered": false
}
```

## 6. Error Handling

- `GET /learning/study/topic/:topicId`: malformed UUID -> `BadRequestException` (400); valid UUID but missing/inaccessible topic -> `NotFoundException` (404)
- Review target progress missing: existing `NotFoundException`
- Archived progress reviewed: `AlreadyArchivedException`
- WordSense content missing/incomplete:
  - exclude card from response
  - log warning for diagnostics

No session-level hard failure for a single malformed card.

## 7. Frontend Design

### 7.1 Frontend module additions

```text
client/src/modules/learning/
├── pages/
│   ├── learning.page.tsx (existing, enhanced)
│   └── study-session.page.tsx (new: /learning/study)
├── components/
│   ├── flashcard-view.tsx
│   ├── rating-buttons.tsx
│   ├── study-progress.tsx
│   └── session-complete-card.tsx (optional)
├── hooks/
│   ├── use-due-cards.ts
│   ├── use-topic-cards.ts
│   └── use-review-card.ts
├── services/
│   └── study.api.ts
└── stores/
    └── use-study-session-store.ts
```

### 7.2 Routes and URL validation

- Keep existing `/study` route for flashcard mode.
- Add new route: `/learning/study` for dictionary-based study.

Entry patterns:
- Start Review: `/learning/study?mode=due&index=0`
- Study by Topic: `/learning/study?mode=topic&topicId=<id>&index=0`

Validation/fallback:
- invalid `mode` -> default to `due`
- `mode=topic` without valid `topicId` -> redirect to `/learning`
- if topic API returns 400/404 in topic mode -> navigate back to `/learning` and show a toast error message
- invalid/out-of-range `index` -> clamp to `[0, cards.length - 1]` (or `0` if empty)

### 7.3 API service

`study.api.ts`:
- `getDueCards()` -> `GET /learning/study/due`
- `getTopicCards(topicId)` -> `GET /learning/study/topic/:topicId`
- `reviewCard(payload)` -> `POST /learning/review`

### 7.4 Hooks + query keys

- `useDueCards()` -> `['study', 'due']`
- `useTopicCards(topicId)` -> `['study', 'topic', topicId]`
- `useReviewCard()` mutation -> `['study', 'review']`

Post-review data strategy:
- During active session: update local Zustand session state and auto-advance without forced refetch.
- Also invalidate list keys in background:
  - always invalidate `['study', 'due']`
  - invalidate `['study', 'topic', topicId]` when in topic mode

### 7.5 Zustand session store

State:
- `cards`
- `currentIndex`
- `flipped`
- `sessionMode`
- `topicId?`
- `reviewedCount`
- `correctLikeCount`
- `startedAt`
- `isSubmittingRating`

Actions:
- `startSession`
- `flipCard`
- `setIndex`
- `recordRating`
- `setSubmittingRating`
- `goNext`
- `finishSession`
- `resetSession`

### 7.6 Session interaction

- Card shows front first.
- Flip via button and optional `Space` shortcut.
- Ratings via UI + optional keyboard `1..4`.
- Disable rating inputs while mutation in-flight (`isSubmittingRating=true`) to prevent double submit.
- On rating success:
  1. update session counters/state
  2. show short feedback (interval / next due)
  3. auto-advance

## 8. Testing Strategy

### 8.1 Backend

- Query handler tests:
  - due filter correctness
  - topic word retrieval integration
  - deterministic sorting
  - 100-card cap behavior
  - malformed content exclusion behavior
- Controller e2e:
  - `GET /learning/study/due`
  - `GET /learning/study/topic/:topicId`
  - `POST /learning/review` integration from study flow
  - topic not found/inaccessible returns expected status

### 8.2 Frontend

- Hook tests:
  - query/mutation behavior and invalidation
- Store tests:
  - index movement, recording ratings, reset/finish, in-flight submit state
- Component/page tests:
  - flip behavior
  - rating action wiring
  - keyboard shortcuts
  - auto-advance
  - double-submit prevention while request pending
  - empty-session states (due/topic)

## 9. Non-Goals (Phase 1)

- No new FSRS algorithm variations
- No quiz/typing/listening answer modes yet
- No backend-persisted study session entity
- No session-level analytics domain events
- No refactor of existing flashcard `/study` route
- No auto-create-progress on topic-card review

## 10. Future Compatibility

This design keeps extension seams for Phase 2+:
- add mode-specific renderers (quiz/typing/listening) over same study retrieval
- maintain single FSRS truth in progress module
- optionally add session analytics/events later without changing review core
- optionally support auto-create progress on first topic review in a later phase

## 11. Acceptance Criteria

1. User can start due-card review from `/learning` and complete a session in `/learning/study`.
2. User can start topic-based study and review topic cards with deterministic ordering.
3. Card content uses WordSense mapping:
   - front = headword (+ pos)
   - back = definition + example
   - hint = pos
4. Rating updates scheduling via existing `POST /learning/review` response contract.
5. No duplicated FSRS logic in study module.
6. Existing topic and progress modules remain owners of their domain concerns.
7. Empty due/topic results return non-error responses and render empty-state UI.
8. Missing/malformed WordSense content is skipped without failing the session response.
9. Invalid study URL params are handled with defined fallbacks/redirects.
10. Rating cannot be submitted twice while a prior review mutation is in-flight.
