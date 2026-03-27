# Phase 2: Study Session Tracking + Analytics

**Date:** 2026-03-27
**Status:** Approved
**Phase:** 2 of N

---

## Overview

Phase 1 implemented a stateless study session (cards loaded client-side, reviews sent one-by-one to `POST /learning/senses/:id/review`). Phase 2 persists session lifecycle to PostgreSQL, enabling analytics, session history, and richer completion summaries.

The backend gains a `StudySession` aggregate with two new ORM entities. The frontend syncs session state to the URL for refresh/back-navigation resilience while keeping the UX inline.

**Phase 1 endpoint lifecycle:** `POST /learning/senses/:id/review` (→ `ReviewWordHandler`) is kept as-is. It remains the canonical write path for FSRS progress. Phase 2 adds `POST /learning/study/session/review` as the session-aware path; internally it dispatches the same `ReviewWordCommand`. Both endpoints coexist — the old one is not deprecated in Phase 2.

---

## Design Principles

- **YAGNI**: Only what's needed for Phase 2. Phase 3 extensions (quiz, typing, listening) are designed for but not implemented.
- **Orthogonal concerns**: Study session tracking does NOT modify existing review logic. `ReviewWordHandler` is unchanged. Session tracking hooks into `WordReviewedEvent`.
- **Stateless-first**: The server is still stateless per HTTP request. `StudySession` is a persistence record, not a server-side session object.

---

## Backend

### Domain Entities

**`StudySession`** — aggregate root (no parent entity)

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `userId` | `uuid` | Indexed |
| `tenantId` | `uuid` | Indexed |
| `studyType` | `string` | `'flashcard'` in Phase 2. Extensible to `'quiz'`, `'typing'`, `'listening'` in Phase 3 |
| `scope` | `string` | `'due'` \| `'topic'` |
| `topicId` | `uuid` | nullable |
| `enrolledCardIds` | `text[]` | Array of `wordSenseId` UUIDs selected at session start |
| `reviewedCount` | `int` | Default `0`, incremented per review |
| `correctCount` | `int` | Default `0`, incremented when `rating >= 3` |
| `startedAt` | `datetime` | Set at creation |
| `completedAt` | `datetime` | nullable, set on completion |
| `status` | `string` | `'IN_PROGRESS'` \| `'COMPLETED'` \| `'ABANDONED'` |

**`StudyReviewLog`** — child entity

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `sessionId` | `uuid` | FK → `StudySession.id`, indexed |
| `wordSenseId` | `uuid` | The card reviewed |
| `rating` | `int` | `1` \| `2` \| `3` \| `4` |
| `reviewDurationMs` | `int` | Client-supplied |
| `reviewedAt` | `datetime` | Server timestamp |

### API Endpoints

#### `POST /learning/study/session/start`

Creates a new study session. Resolves the card list server-side, stores enrolled card IDs, returns session ID and cards to the client.

**Request body:**
```json
{
  "studyType": "flashcard",
  "scope": "due" | "topic",
  "topicId": "uuid" | null
}
```

**Response (`201 Created`):**
```json
{
  "sessionId": "uuid",
  "cards": [ /* StudyCardResponseDto[] — same shape as GET /learning/study/due */ ]
}
```

**Behavior:**
1. Resolve cards — reuse existing `GetDueCardsQuery` / `GetTopicCardsQuery` logic (inject query bus)
2. Extract `wordSenseId[]` from resolved cards
3. Create `StudySession` entity: `status=IN_PROGRESS`, `enrolledCardIds=wordSenseIds`, `reviewedCount=0`, `correctCount=0`, `startedAt=now`
4. Persist
5. Emit `StudySessionStartedEvent`
6. Return `{ sessionId, cards }`

**Errors:**
- `400` — invalid `studyType` or `scope`
- `404` — `topicId` not found or not owned by user (when `scope=topic`)

---

#### `POST /learning/study/session/review`

Submits a review within an active session. Delegates to existing `ReviewWordHandler` via `CommandBus`, then appends a `StudyReviewLog` and updates session stats.

**Request body:**
```json
{
  "sessionId": "uuid",
  "wordSenseId": "uuid",
  "rating": 1 | 2 | 3 | 4,
  "reviewDurationMs": 1234
}
```

**Response (`200 OK`):**
```json
{
  "wordSenseId": "uuid",
  "nextDueDate": "2026-04-01T00:00:00Z" | null,
  "intervalDays": 1,
  "isDue": true,
  "isMastered": false
}
```

**Behavior:**
1. Load `StudySession` by `sessionId`, verify `status=IN_PROGRESS` and user ownership
2. Dispatch `ReviewWordCommand(userId, tenantId, wordSenseId, rating, reviewDurationMs)` via `CommandBus`
3. `ReviewWordHandler` emits `WordReviewedEvent` after persisting progress
4. `StudySessionReviewLogHandler` listens to `WordReviewedEvent` and creates `StudyReviewLog`
5. Increment `session.reviewedCount++`; if `rating >= 3`, increment `session.correctCount++`
6. Persist `StudySession`
7. Return review result

**Errors:**
- `404` — session not found or not owned by user
- `400` — session is not `IN_PROGRESS` (already completed or abandoned)
- `400` — word sense not in session's `enrolledCardIds` (card was not part of this session's card set)

**Duplicate review guard:** `StudyReviewLog` has a `UNIQUE` constraint on `(sessionId, wordSenseId)`. If a client retries a review (e.g. network timeout), subsequent attempts return `409 Conflict`. This prevents double-counting in `reviewedCount` and `correctCount`.

---

#### `POST /learning/study/session/complete`

Marks a session as completed. Called explicitly by the frontend when all cards are reviewed.

**Request body:**
```json
{ "sessionId": "uuid" }
```

**Response (`200 OK`):**
```json
{ "sessionId": "uuid", "completedAt": "2026-03-27T10:05:00Z" }
```

**Behavior:**
1. Load `StudySession`, verify ownership and `status=IN_PROGRESS`
2. Set `status=COMPLETED`, `completedAt=now`
3. Persist
4. Emit `StudySessionCompletedEvent`
5. Return

**Errors:**
- `404` — session not found or not owned
- `400` — session already `COMPLETED`

---

#### `GET /learning/study/session/:id`

Returns session summary with rating breakdown.

**Response (`200 OK`):**
```json
{
  "sessionId": "uuid",
  "studyType": "flashcard",
  "scope": "due",
  "topicId": null,
  "totalCards": 20,
  "reviewedCards": 20,
  "accuracy": 80.0,
  "timeSpentMs": 300000,
  "ratingBreakdown": {
    "again": 2,
    "hard": 2,
    "good": 12,
    "easy": 4
  },
  "startedAt": "2026-03-27T10:00:00Z",
  "completedAt": "2026-03-27T10:05:00Z",
  "status": "COMPLETED"
}
```

**Behavior:**
1. Load `StudySession` by id, verify ownership
2. Load all `StudyReviewLog` entries for session
3. Compute `ratingBreakdown` from log entries
4. Compute `timeSpentMs = completedAt - startedAt`
5. Compute `accuracy = Math.round((correctCount / reviewedCount) * 1000) / 10` (rounded to 1 decimal place, 0–100) if `reviewedCount > 0`, else `0`
6. Return `SessionSummaryDto`

**Errors:**
- `404` — session not found or not owned

---

### Domain Events

| Event | Emitted by | Payload |
|---|---|---|
| `StudySessionStartedEvent` | `StartStudySessionHandler` | `{ sessionId, userId, studyType, scope }` |
| `StudySessionCompletedEvent` | `CompleteStudySessionHandler` | `{ sessionId, userId, reviewedCount, accuracy }` |
| `WordReviewedEvent` | `ReviewWordHandler` | existing — used by `StudySessionReviewLogHandler` as trigger |

`StudySessionReviewLogHandler` listens to `WordReviewedEvent` and creates `StudyReviewLog`. It does NOT emit its own event.

---

### Module Structure

```
study/
 ├── application/
 │   ├── commands/
 │   │   ├── start-study-session.command.ts
 │   │   ├── start-study-session.handler.ts
 │   │   ├── study-session-review.command.ts
 │   │   ├── study-session-review.handler.ts
 │   │   ├── complete-study-session.command.ts
 │   │   └── complete-study-session.handler.ts
 │   └── queries/
 │       ├── get-session-summary.query.ts
 │       └── get-session-summary.handler.ts
 ├── domain/
 │   ├── entities/
 │   │   ├── study-session.entity.ts
 │   │   └── study-review-log.entity.ts
 │   └── events/
 │       ├── study-session-started.event.ts
 │       └── study-session-completed.event.ts
 ├── dto/
 │   ├── requests/
 │   │   ├── start-study-session.request.dto.ts
 │   │   ├── study-session-review.request.dto.ts
 │   │   └── complete-study-session.request.dto.ts
 │   └── responses/
 │       └── session-summary.response.dto.ts
 ├── infrastructure/
 │   ├── persistence/
 │   │   ├── study-session.orm-entity.ts
 │   │   └── study-review-log.orm-entity.ts
 │   └── repositories/
 │       └── study-session.repository.ts
 ├── listeners/
 │   └── study-session-review-log.listener.ts
 │       ← listens to WordReviewedEvent, creates StudyReviewLog
 └── study.module.ts  ← updated: exports all new commands/queries, imports ProgressModule
```

**Module wiring:**
- `StudyModule` imports `ProgressModule` to inject `CommandBus` (for `ReviewWordCommand`) and `FsrsSchedulerService`
- `ProgressModule` already exports both — no changes needed to `ProgressModule` itself
- `StudyModule` registers `MikroOrmModule.forFeature([StudySessionOrmEntity, StudyReviewLogOrmEntity])`
- `StudyModule` registers `EventEmitterModule.forRoot()` (or uses parent's emitter) for `StudySessionStartedEvent` / `StudySessionCompletedEvent`
- `StudySessionReviewLogListener` uses `@OnEvent(WordReviewedEvent)` — it must be registered as a provider in `StudyModule`

---

## Frontend

### URL State

| State | URL |
|---|---|
| Active study (due) | `/learning/study?mode=due` |
| Active study (topic) | `/learning/study?mode=topic&topicId=<uuid>` |
| Summary | `/learning/study?sessionId=<uuid>&completed=true` |

The session is **inline** on the study page — no separate route for summary. URL params are the source of truth for `sessionId` and `completed`.

**Session resumption:** When the page loads with `?sessionId=<id>`, the frontend fetches `GET /session/:id` and branches:

| Session status | URL lacks `completed=true` | URL has `completed=true` |
|---|---|---|
| `IN_PROGRESS` | Show "Resume session?" prompt: **Continue** (resume with remaining cards) or **Abandon** (redirect to `/learning`) | Show summary (user reached it mid-study) |
| `COMPLETED` | Redirect to `/learning/study?sessionId=<id>&completed=true` (inject `completed=true`) | Show summary |
| `ABANDONED` | Redirect to `/learning` immediately | Show summary |

"Continue" reloads the remaining cards (server resolves the not-yet-reviewed `wordSenseId` subset from `enrolledCardIds` minus reviewed entries in `StudyReviewLog`). "Abandon" calls `POST /session/complete` to finalize the session before redirecting.

### Zustand Store Updates

`useStudySessionStore` adds two fields:

```typescript
interface StudySessionStore {
  // ... existing fields (cards, currentIndex, flipped, ...) ...

  sessionId: string | null;       // set by useStartSession after server creates session
  completed: boolean;             // set to true after POST /session/complete

  // Rating breakdown tracked client-side during session
  // Mapping: rating 1→again, 2→hard, 3→good, 4→easy
  ratingBreakdown: { again: 0, hard: 0, good: 0, easy: 0 };

  startSession: (cards: StudyCard[], mode: SessionMode, topicId?: string, sessionId?: string) => void;
  recordRating: (rating: 1|2|3|4) => void;  // updated to update ratingBreakdown
  finishSession: (sessionId: string) => void; // sets completed=true
  resetSession: () => void;        // resets sessionId, completed, ratingBreakdown
}
```

### New Hooks

**`useStartSession(mode, topicId?)`**:
```typescript
// Calls POST /learning/study/session/start
// On success: { sessionId, cards }
// Navigates to /learning/study?sessionId=<id>
// Also calls store.startSession(cards, mode, topicId, sessionId)
```

**`useReviewCard(sessionId)`**:
```typescript
// Calls POST /learning/study/session/review (not the learning/ endpoint)
// On success: invalidates relevant study keys
// Updates ratingBreakdown in store
```

**`useCompleteSession()`**:
```typescript
// Calls POST /learning/study/session/complete
// On success: store.finishSession(sessionId)
// Navigates to /learning/study?sessionId=<id>&completed=true
```

**`useSessionSummary(sessionId)`**:
```typescript
// Calls GET /learning/study/session/:id
// Returns SessionSummary data for the summary screen
```

### API Service Additions (`study.api.ts`)

```typescript
export const StudyApi = {
  // ... existing (getDueCards, getTopicCards, reviewCard) ...

  startSession: (payload: StartSessionPayload) =>
    api.post('/learning/study/session/start', payload),

  reviewCard: (payload: StudySessionReviewPayload) =>
    api.post('/learning/study/session/review', payload),

  completeSession: (sessionId: string) =>
    api.post('/learning/study/session/complete', { sessionId }),

  getSessionSummary: (sessionId: string) =>
    api.get(`/learning/study/session/${sessionId}`),
};
```

### Components

**`SessionCompleteCard`** — updated to:
- Calls `GET /session/:id` (via `useSessionSummary`) and uses server as single source of truth for all summary data (`accuracy`, `timeSpentMs`, `reviewedCards`, `ratingBreakdown`)
- Show a "Back to Learning" button navigating to `/learning`
- If the fetch fails, fall back to client-tracked `reviewedCount`, `correctCount`, and `ratingBreakdown` from the store

**No new pages or routes** — summary is rendered by the existing `study-session.page.tsx` when `completed=true`.

---

## Phase 3 Extensibility

The following are **designed but not implemented** in Phase 2:

- `studyType: 'quiz'` — card-front shows a definition, user selects from multiple headwords
- `studyType: 'typing'` — user types the headword; spelling is checked against `WordOrmEntity.text`
- `studyType: 'listening'` — audio playback of example sentence; user types what they hear
- Session history page (`/learning/study/history`) — list of past `StudySession` records
- Per-card analytics — query `StudyReviewLog` for a given word sense over time

`studyType` and `scope` fields are already in the schema to make these extensions additive migrations.
