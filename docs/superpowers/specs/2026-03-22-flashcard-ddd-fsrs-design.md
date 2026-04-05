# Flashcard Module — DDD + FSRS Redesign Spec

**Date:** 2026-03-22
**Status:** Draft

---

## 1. Overview

The flashcard module is rebuilt with proper Domain-Driven Design architecture, replacing the existing anemic domain model (ORM entities used directly as domain objects). The module gains FSRS (Free Spaced Repetition Scheduler) for intelligent card scheduling.

**Goals:**
- Replace ORM entities-as-domain-objects with true aggregates, entities, and value objects
- Implement FSRS algorithm for spaced repetition scheduling
- Decouple study stats updates via domain events
- Follow existing project patterns (CQRS, EventBus, `AggregateRoot`, `Entity`, `ValueObject` bases)

---

## 2. Domain Layer

### 2.1 Value Objects

| Value Object | Type | Fields / Variants |
|---|---|---|
| `FlashcardId` | Wrapped `string` (UUID) | Wraps `v7()` UUID |
| `FlashcardSource` | Enum | `dictionary`, `custom` |
| `ReviewRating` | Enum | `Again(1)`, `Hard(2)`, `Good(3)`, `Easy(4)` |
| `CardState` | Enum | `new`, `learning`, `review`, `relearning`, `grace`; **`grace`** is entered after a lapse — card re-enters relearning with a short interval (10min → 1day → review) |
| `FsrsParameters` | Object VO | `stability`, `difficulty`, `lapses`, `reps`, `state: CardState`, `dueDate`; **`isMastered`** is derived: `true` when `stability >= 30 days AND lapses === 0` |
| `StudyStreak` | Value Object | `currentStreak`, `lastStudyDate` |

All value objects extend `ValueObject<T>` from `@core/ddd`. Immutable, structural equality via `equals()`.

### 2.2 Entities

#### `FlashcardSchedulingState` (Entity)
Child entity of `Flashcard` aggregate. Stores all FSRS-related state.

```
Props:
  - id: FlashcardId
  - stability: number      (days, how reliably card is remembered)
  - difficulty: number    (0–1, how hard card is)
  - lapses: number        (times card was forgotten)
  - reps: number          (total successful reviews)
  - state: CardState      (new | learning | review | relearning | grace)
  - dueDate: Date         (next review date)
  - lastReviewDate: Date | null
```

#### `ReviewLog` (Entity)
Immutable record of every review event. Append-only. Owned by the `Flashcard` aggregate — no independent identity outside the aggregate.

```
Props:
  - id: string (UUID)
  - cardId: FlashcardId
  - userId: string
  - tenantId: string
  - rating: ReviewRating
  - previousState: CardState
  - newState: CardState
  - previousStability: number
  - newStability: number
  - previousDifficulty: number
  - newDifficulty: number
  - reviewDurationMs: number
  - reviewedAt: Date
```

### 2.3 Aggregates

#### `Flashcard` (Aggregate Root)
Owns card content and delegates scheduling to domain service.

```
Props:
  - id: FlashcardId
  - tenantId: string
  - userId: string
  - front: string (max 500)
  - back: string (max 1000)
  - hint: string | null (max 255)
  - notes: string | null (max 1000)
  - source: FlashcardSource
  - wordSenseId: string | null
  - schedulingState: FlashcardSchedulingState
  - createdAt: Date
  - updatedAt: Date

Factory methods:
  - static create(props): Flashcard       ← initializes scheduling to NEW defaults
  - static rehydrate(props, schedulingState): Flashcard

Domain methods:
  - updateContent(front, back, hint, notes): void  ← publishes FlashcardUpdatedEvent
  - review(rating: ReviewRating, newParams: FsrsParameters): void  ← publishes CardReviewedEvent

Domain events:
  - FlashcardCreatedEvent
  - FlashcardUpdatedEvent
  - FlashcardDeletedEvent
  - CardReviewedEvent  ← carries newParams, rating for event handler
```

#### `StudyStats` (Aggregate Root)
Per-user cumulative study statistics.

```
Props:
  - id: string (UUID)
  - tenantId: string
  - userId: string
  - currentStreak: number
  - longestStreak: number
  - totalCardsReviewed: number
  - totalStudyTimeMinutes: number
  - masteredCards: number
  - lastStudyDate: Date | null
  - createdAt: Date
  - updatedAt: Date

Factory methods:
  - static create(tenantId, userId): StudyStats

Domain methods:
  - recordReview(rating: ReviewRating, durationMs: number, isMastered: boolean): void
    ← updates streak, increments total, adds study time, increments mastered if applicable
    ← publishes StudyStatsUpdatedEvent (optional, for analytics)
```

### 2.4 Domain Service

#### `FsrsSchedulerService`

Pure FSRS v4 algorithm implementation. Stateless, injected as a domain service.

```
Method:
  calculateNext(
    currentParams: FsrsParameters,
    rating: ReviewRating,
    now: Date,
  ): FsrsParameters

  // Internal steps:
  1. Map rating to FSRS internal score (0–1)
  2. Apply stability + difficulty update matrices
  3. Compute new stability, difficulty, lapses, reps
  4. Determine new CardState based on interval and state machine
  5. Compute next dueDate from interval
  6. Return new FsrsParameters
```

Default FSRS config (via environment variables):
```
FSRS_RETENTION_RATE=0.9       # Target retention (0–1)
FSRS_MAX_INTERVAL=365         # Maximum review interval in days
FSRS_EASY_INTERVAL=4         # Easy bonus interval in days
FSRS_HARD_INTERVAL=1         # Hard interval in days
FSRS_LAPSE_INTERVALS=[600,86400]  # Grace intervals in seconds: 10min, 1 day
```

**Concurrency:** `FlashcardSchedulingState.update()` uses optimistic locking via MikroORM's `version`/`updatedAt` column to prevent lost updates from concurrent reviews.

**StudyStats findOrCreate race condition:** `findOrCreate` uses `INSERT ... ON CONFLICT DO NOTHING` (upsert) to handle concurrent creation safely. The repository implementation must use this pattern rather than a check-then-insert race.

### 2.5 Domain Events

| Event | Extends | Key Payload |
|---|---|---|
| `FlashcardCreatedEvent` | `DomainEvent` | `flashcard: Flashcard` |
| `FlashcardUpdatedEvent` | `DomainEvent` | `flashcard: Flashcard`, `previousVersion: number` |
| `FlashcardDeletedEvent` | `DomainEvent` | `flashcardId: string`, `userId: string` |
| `CardReviewedEvent` | `DomainEvent` | `cardId: string`, `userId: string`, `rating: ReviewRating`, `newParams: FsrsParameters`, `reviewDurationMs: number` |
| `StudyStatsUpdatedEvent` | `DomainEvent` | `stats: StudyStats` (optional, for future analytics) |

---

## 3. Application Layer (CQRS)

### 3.1 Commands

| Command | Input | Handler | Output |
|---|---|---|---|
| `CreateFlashcardCommand` | `tenantId, userId, front, back, source, hint?, notes?, wordSenseId?` | `CreateFlashcardHandler` | `FlashcardResponseDto` |
| `UpdateFlashcardCommand` | `id, userId, tenantId, front?, back?, hint?, notes?` | `UpdateFlashcardHandler` | `FlashcardResponseDto` |
| `DeleteFlashcardCommand` | `id, userId, tenantId` | `DeleteFlashcardHandler` | `boolean` |
| `ReviewCardCommand` | `cardId, userId, tenantId, rating, reviewDurationMs` | `ReviewCardHandler` | `ReviewResultResponseDto` |

### 3.2 Queries

| Query | Handler | Output |
|---|---|---|
| `GetFlashcardsQuery` | `GetFlashcardsHandler` | `FlashcardResponseDto[]` (paginated) |
| `GetDueCardsQuery` | `GetDueCardsHandler` | `DueCardResponseDto[]` |
| `GetStudyStatsQuery` | `GetStudyStatsHandler` | `StudyStatsResponseDto` |

### 3.3 Event Handlers

| Event | Handler | Effect |
|---|---|---|
| `CardReviewedEvent` | `UpdateStudyStatsHandler` | Calls `StudyStats.recordReview()`; creates stats if not exists |

### 3.4 Orchestration Flow — Review Card

```
ReviewCardHandler.execute(command):
  1. Load Flashcard aggregate (repository.findById)
  2. Load FlashcardSchedulingState (repository.findSchedulingState)
  3. Run FsrsSchedulerService.calculateNext(currentParams, rating, now)
  4. Call flashcard.review(rating, newParams)  ← adds CardReviewedEvent
  5. Create ReviewLog entity
  6. Repository.persist(flashcard)  ← cascades to scheduling state
  7. Repository.persist(reviewLog)
  8. em.flush()  ← single atomic transaction
  9. Publish domain events via aggregate.publishEvents()
  10. Return { newState, nextDueDate, interval }

UpdateStudyStatsHandler.handle(event):
  1. Repository.findOrCreate(userId, tenantId)
  2. stats.recordReview(rating, durationMs, isMastered)
  3. Repository.persist(stats)
  4. em.flush()  ← separate transaction (eventual consistency)
```

---

## 4. Infrastructure Layer

### 4.1 ORM Entities

| ORM Entity | Table | Notes |
|---|---|---|
| `FlashcardOrmEntity` | `flashcards` | Maps `Flashcard` aggregate props |
| `FlashcardSchedulingStateOrmEntity` | `flashcard_scheduling_states` | One-to-one with `flashcard` |
| `ReviewLogOrmEntity` | `review_logs` | Many-to-one with `flashcard` |
| `StudyStatsOrmEntity` | `study_stats` | Maps `StudyStats` aggregate props |

Relationships:
- `FlashcardOrmEntity` → `FlashcardSchedulingStateOrmEntity`: one-to-one, cascade all
- `FlashcardOrmEntity` → `ReviewLogOrmEntity`: one-to-many, cascade persist only
- `StudyStatsOrmEntity`: standalone, keyed by `(userId, tenantId)`

### 4.2 Repositories

All repository interfaces live in `domain/repositories/`. Implementations live in `infrastructure/repositories/`.

| Interface | Key Methods |
|---|---|
| `IFlashcardRepository` | `findById`, `findByUserId`, `findDueCards(now, userId, tenantId)`, `persist(Flashcard)`, `delete(id)` |
| `IReviewLogRepository` | `create(ReviewLog)`, `findByCardId`, `findByUserId` |
| `IStudyStatsRepository` | `findByUserId`, `findOrCreate`, `persist(StudyStats)` |

**Transaction support:** Implementations use `EntityManager.transactional()` or accept an `EntityManager` for transaction-scoped injection.

### 4.3 Mappers

| Mapper | `toDomain` | `toPersistence` | `toResponse` |
|---|---|---|---|
| `FlashcardMapper` | `FlashcardOrmEntity → Flashcard` | `Flashcard → FlashcardOrmEntity` | `Flashcard → FlashcardResponseDto` |
| `FlashcardSchedulingStateMapper` | ORM → VO | VO → ORM | — |
| `ReviewLogMapper` | `ReviewLogOrmEntity → ReviewLog` | `ReviewLog → ReviewLogOrmEntity` | `ReviewLog → ReviewLogResponseDto` |
| `StudyStatsMapper` | `StudyStatsOrmEntity → StudyStats` | `StudyStats → StudyStatsOrmEntity` | `StudyStats → StudyStatsResponseDto` |

Mappers live in `infrastructure/mappers/`.

---

## 5. DTOs

### Request DTOs

**`CreateFlashcardRequestDto`** — same as existing
**`UpdateFlashcardRequestDto`** — same as existing
**`ReviewCardRequestDto`** (new)
```
  rating: 1 | 2 | 3 | 4
  reviewDurationMs: number
```

### Response DTOs

**`FlashcardResponseDto`** — same as existing

**`ReviewResultResponseDto`** (new)
```
  cardId: string
  newState: CardState
  nextDueDate: string (ISO)
  intervalDays: number
  isMastered: boolean
```

### Validation

Validation constraints live in request DTOs (Zod schemas) and are enforced by class-validator decorators. Domain invariants (e.g., `Flashcard.front` max 500 chars) are enforced at the command handler level before creating the aggregate. Domain entities do not validate input — they assume pre-validated data from the application layer.

---

## 6. Directory Structure

```
flashcard/
├── domain/
│   ├── entities/
│   │   ├── flashcard.aggregate.ts
│   │   ├── flashcard-scheduling-state.entity.ts
│   │   ├── review-log.entity.ts
│   │   └── study-stats.aggregate.ts
│   ├── value-objects/
│   │   ├── flashcard-id.vo.ts
│   │   ├── flashcard-source.vo.ts
│   │   ├── review-rating.vo.ts
│   │   ├── card-state.vo.ts
│   │   └── fsrs-parameters.vo.ts
│   ├── services/
│   │   └── fsrs-scheduler.service.ts
│   ├── events/
│   │   ├── flashcard-created.event.ts
│   │   ├── flashcard-updated.event.ts
│   │   ├── flashcard-deleted.event.ts
│   │   └── card-reviewed.event.ts
│   └── repositories/
│       ├── flashcard.repository.interface.ts
│       ├── review-log.repository.interface.ts
│       └── study-stats.repository.interface.ts
├── application/
│   ├── commands/
│   │   ├── create-flashcard/
│   │   │   ├── create-flashcard.command.ts
│   │   │   └── create-flashcard.handler.ts
│   │   ├── update-flashcard/
│   │   ├── delete-flashcard/
│   │   └── review-card/
│   │       ├── review-card.command.ts
│   │       └── review-card.handler.ts
│   ├── queries/
│   │   ├── get-flashcards/
│   │   ├── get-due-cards/
│   │   └── get-study-stats/
│   └── events/
│       └── update-study-stats.handler.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── flashcard.orm-entity.ts
│   │   ├── flashcard-scheduling-state.orm-entity.ts
│   │   ├── review-log.orm-entity.ts
│   │   └── study-stats.orm-entity.ts
│   ├── repositories/
│   │   ├── flashcard.repository.ts
│   │   ├── review-log.repository.ts
│   │   └── study-stats.repository.ts
│   └── mappers/
│       ├── flashcard.mapper.ts
│       ├── review-log.mapper.ts
│       └── study-stats.mapper.ts
├── controllers/
│   ├── flashcard.controller.ts
│   └── study.controller.ts  ← + POST /study/review endpoint
├── dto/
│   ├── requests/
│   │   └── review-card.request.dto.ts
│   └── responses/
│       └── review-result.response.dto.ts
└── flashcard.module.ts
```

---

## 7. Migration

A new database migration is required to add:
1. `flashcard_scheduling_states` table (one-to-one with `flashcards`)
2. `review_logs` table
3. `study_stats` table (if not already present)

Existing `flashcards` table is untouched — only new tables are added.

---

## 8. Out of Scope (Future)

- Archival strategy for `ReviewLog` (see spec notes)
- Analytics / heatmap queries
- Card sharing between users
- Custom FSRS parameter configuration per user
