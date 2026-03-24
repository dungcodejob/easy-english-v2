# Learning Architecture Refactor — Unified FSRS & Multi-Mode Design

**Status:** Draft
**Date:** 2026-03-24
**Author:** Claude Opus 4.6

---

## Context

The `learning/progress` and `flashcard` modules both manage spaced-repetition state independently. `UserWordSenseProgress` stores raw unused fields (`masteryLevel`, `nextReviewAt`) while `Flashcard` carries a full `FsrsParameters` embedded inside it. This creates two sources of truth for mastery state and makes it impossible to share review scheduling across learning modes.

The `learning/topic` module was recently refactored to DDD. Its `TopicWord` entity has a `WordLearningStatus` enum (`NEW | LEARNING | MASTERED`) that is not derived from any scheduling system.

---

## Goals

1. **Unify FSRS state** — `UserWordSenseProgress` is the single source of truth for every word's review schedule, shared across all learning modes.
2. **Support multiple learning modes** — Flashcard, Dictionary (My Learning), and future modes (Quiz, Typing, Listening) all write to the same aggregate.
3. **Hybrid flashcard model** — Dictionary-linked cards share FSRS state; custom cards are independent.
4. **Keep domain boundaries clean** — FSRS logic is a reusable domain service; learning modes are thin adapters.
5. **Migrate safely** — existing data and API contracts are preserved throughout.

---

## Non-Goals

- Quiz, Typing, and Listening modes are **out of scope** for this implementation. They are designed here but not built.
- Per-topic FSRS scheduling (topics are a study context, not a scheduling boundary).

---

## Decision Log

| Question | Decision |
|---|---|
| One active record per user per... | Word Sense (not per Word) |
| Unified FSRS state across modes? | Yes — `UserWordSenseProgress` is the canonical store |
| Can flashcards be custom / standalone? | Hybrid — dictionary-linked (shared state) + custom (independent) |
| FSRS state location | `UserWordSenseProgress` (moved from `Flashcard`) |
| Topic purpose | Sets study context; no separate FSRS state |
| Initial scope | Flashcard + Dictionary modes only |
| `TopicWord.status` column | Dropped; derived at read time from `UserWordSenseProgress.fsrsParams` |

---

## Domain Architecture

### `UserWordSenseProgress` — Canonical FSRS Aggregate

```typescript
// learning/progress/domain/entities/user-word-sense-progress.entity.ts

export class UserWordSenseProgress extends AggregateRoot {
  private _userId: string;
  private _wordSenseId: string;
  private _fsrsParams: FsrsParameters;   // replaces masteryLevel, reviewCount, nextReviewAt, lastReviewedAt
  private _archivedAt: Date | null;

  static create(props: { userId, wordSenseId }): UserWordSenseProgress
  static rehydrate(props: UserWordSenseProgressProps): UserWordSenseProgress
  applyReview(rating: ReviewRating): Result<FsrsParameters, 'already_archived'>
  archive(): void
  restore(): void

  // Derived getters
  get isArchived(): boolean
  get isMastered(): boolean   // from fsrsParams.isMastered
  get isDue(): boolean        // from fsrsParams.dueDate <= now
}
```

### `FsrsParameters` — Value Object (moved from `flashcard`)

```typescript
// learning/progress/domain/value-objects/fsrs-parameters.vo.ts

export type CardStateValue = 'new' | 'learning' | 'review' | 'relearning' | 'grace';

export class CardState extends ValueObject<{ value: CardStateValue }> {
  static get NEW(): CardState       { return new CardState({ value: 'new' }) }
  static get LEARNING(): CardState   { return new CardState({ value: 'learning' }) }
  static get REVIEW(): CardState     { return new CardState({ value: 'review' }) }
  static get RELEARNING(): CardState { return new CardState({ value: 'relearning' }) }
  static get GRACE(): CardState      { return new CardState({ value: 'grace' }) }
  static from(value: string): CardState { return new CardState({ value: value as CardStateValue }) }
}

export class FsrsParameters extends ValueObject<{
  stability: number;        // recall stability (days)
  difficulty: number;        // 0–1, ease factor
  lapses: number;            // number of times card was forgotten
  reps: number;              // consecutive correct reviews
  state: CardState;
  dueDate: Date | null;      // null for new (unreviewed) cards
  lastReviewDate: Date | null;
}> {
  get isMastered(): boolean  // stability >= 30 && lapses === 0

  static newCardDefaults(): FsrsParameters   // dueDate = null, state = 'new', stability = 0
}
```

### `ReviewRating` — Value Object (moved from `flashcard`)

```typescript
// learning/progress/domain/value-objects/review-rating.vo.ts

export type ReviewRatingValue = 1 | 2 | 3 | 4;

export class ReviewRating extends ValueObject<{ value: ReviewRatingValue }> {
  static get AGAIN(): ReviewRating    { return new ReviewRating({ value: 1 }) }  // 1
  static get HARD(): ReviewRating     { return new ReviewRating({ value: 2 }) }  // 2
  static get GOOD(): ReviewRating     { return new ReviewRating({ value: 3 }) }  // 3
  static get EASY(): ReviewRating     { return new ReviewRating({ value: 4 }) }  // 4
}
```

### `FsrsSchedulerService` — Domain Service (moved from `flashcard`)

```typescript
// learning/progress/domain/services/fsrs-scheduler.service.ts

@Injectable()
export class FsrsSchedulerService {
  calculateNext(
    current: FsrsParameters,
    rating: ReviewRating,
    now: Date,
  ): FsrsParameters
  // Same algorithm as current implementation
  // No ORM dependencies — stateless, pure domain logic
}
```

### Domain Events on `UserWordSenseProgress`

| Event | Trigger | Key Payload |
|---|---|---|
| `WordLearningStartedEvent` | `UserWordSenseProgress.create()` | `{ aggregateId, userId, wordSenseId }` |
| `WordLearningRemovedEvent` | `archive()` | `{ aggregateId, userId, wordSenseId }` |
| `WordReviewedEvent` | `applyReview()` | `{ aggregateId, userId, wordSenseId, rating, previousParams, newParams }` |
| `WordMasteredEvent` | `applyReview()` when `isMastered` transitions true | `{ aggregateId, userId, wordSenseId }` |

---

## Flashcard Module Changes

### `Flashcard` — Drops FSRS, becomes pure content

**Removed:**
- `_schedulingState: FsrsParameters` field
- `review(rating, newParams, reviewDurationMs)` domain method

**Kept:**
- `_source: FlashcardSource` — `'dictionary'` | `'custom'`
- `_wordSenseId: string | null` — null for custom cards
- `updateContent()`, `markDeleted()`, `publishEvents()`

**Domain events** remain: `FlashcardCreatedEvent`, `FlashcardUpdatedEvent`, `FlashcardDeletedEvent`. `CardReviewedEvent` is replaced by `WordReviewedEvent` (from `UserWordSenseProgress`).

### `ReviewCardHandler` — Refactored

```typescript
async execute(command: ReviewCardCommand): Promise<void> {
  const flashcard = await this.flashcardRepo.findById(command.cardId, ...);
  if (!flashcard) throw new NotFoundException('Card not found');

  if (flashcard.wordSenseId) {
    // Dictionary-linked card — update shared FSRS state
    const progress = await this.progressWriteRepo.findOneByUserAndSense(
      command.userId,
      flashcard.wordSenseId,
    );
    if (!progress) throw new NotFoundException('Word not in learning list');

    const result = progress.applyReview(command.rating);
    if (result.isErr()) throw new ConflictException('Word is archived');

    const { value: newParams } = result;
    const reviewLog = ReviewLog.create({
      cardId: flashcard.id,
      userId: command.userId,
      tenantId: command.tenantId,
      rating: command.rating,
      previousParams: progress.fsrsParams,  // captured before applyReview mutates
      newParams,
      reviewDurationMs: command.reviewDurationMs,
    });
    await this.reviewLogRepo.create(reviewLog);
    await this.em.flush();
    progress.publishEvents(this.logger, this.eventBus);
  }
  // Custom card — no UserWordSenseProgress to update
  flashcard.publishEvents(this.logger, this.eventBus);
}
```

> **Naming:** `this.progressWriteRepo` is the `ILearningWriteRepository` (already injected into the handler). `ReviewLog` accepts `FlashcardId` (ValueObject) for `cardId`.

### `FsrsSchedulerService` Move

- **From:** `modules/flashcard/domain/services/`
- **To:** `modules/learning/progress/domain/services/`
- Module `FlashcardModule` imports `FsrsSchedulerService` via `ProgressModule` export
- Interface unchanged; algorithm unchanged

---

## Learning Modes Architecture

### Design Principle

All learning modes are thin adapters. They translate user interaction into a `ReviewRating` and call `UserWordSenseProgress.applyReview()`. No mode owns FSRS state.

```
User interaction → Mode Adapter → ReviewRating → applyReview() → persist + events
```

### Mode 1: Flashcard (implemented in this scope)

- Endpoint: `POST /study/flashcard/review`
- Reuses refactored `ReviewCardHandler`
- Custom cards: no FSRS update, only stats logging

### Mode 2: Dictionary Review (implemented in this scope)

New handler: `ReviewWordHandler`

- Endpoint: `POST /learning/senses/:senseId/review`
- Command: `ReviewWordCommand { userId, wordSenseId, rating: 1-4, reviewDurationMs }`
- Loads `UserWordSenseProgress` → calls `applyReview()` → flushes → publishes events
- `AddToLearningHandler` and `RemoveFromLearningHandler` are **not changed** — they remain the entry/exit points for the learning list

> **ReviewLog for dictionary reviews:** `ReviewWordHandler` also creates a `ReviewLog` entry to maintain a complete review history for study statistics. `ReviewLog` is extended with a nullable `wordSenseId` column alongside the existing `cardId` column (both nullable, not both set). This keeps all modes logging to the same table. The `ReviewLogMapper` handles both card-based and sense-based entries; `IReviewLogRepository.create()` accepts either.
>
> **`UpdateStudyStatsHandler` decorator:** The `@EventsHandler(CardReviewedEvent)` decorator changes to `@EventsHandler(WordReviewedEvent)`. The `stats.recordReview()` call is unchanged — `rating`, `reviewDurationMs`, and `isMastered` all exist on the new event payload.

### Future Modes (designed, not built)

| Mode | Rating derivation | Notes |
|---|---|---|
| Quiz | Correct answer → `GOOD(3)`, wrong → `AGAIN(1)` | New handler per question type |
| Typing | Exact → `EASY(4)`, hint used → `HARD(2)`, wrong → `AGAIN(1)` | |
| Listening | Played once, correct → `GOOD(3)`, replayed → `HARD(2)`, skipped → `AGAIN(1)` | |

All three follow the same adapter pattern: translate interaction → `applyReview()`.

---

## Topic Module — `TopicWord.status` Derivation

The `status` field on `TopicWord` is no longer stored. Instead it is derived at read time.

**`TopicWordOrmEntity`:**
- Drop `status` column (nullable → remove in post-launch migration)

**`TopicMapper.toResponse()`:**
```typescript
toResponse(topic: Topic, progressMap: Map<string, FsrsParameters>): TopicDto {
  const words = topic.words.map(w => {
    const params = progressMap.get(w.wordSenseId);
    const status = params?.state === 'new' ? 'NEW'
      : params?.state === 'review' || params?.state === 'learning' ? 'LEARNING'
      : params?.isMastered ? 'MASTERED' : 'NEW';
    return { ...this.mapWord(w), status };
  });
  return { ... };
}
```

**`ListTopicWordsHandler`** — changes to enrich each word with live FSRS status:

```typescript
async execute(query: ListTopicWordsQuery): Promise<TopicWordsResponseDto> {
  const topic = await this.topicRepo.findById(query.topicId, query.tenantId, query.userId);
  if (!topic) throw new NotFoundException('Topic not found');

  // Fetch FSRS params for all words in this topic in one query
  const wordSenseIds = topic.words.map(w => w.wordSenseId);
  const progressRecords = await this.em.find(UserWordSenseProgressOrmEntity, {
    wordSense: { $in: wordSenseIds },
    userId: query.userId,
    archivedAt: null,
  });
  const progressMap = new Map(progressRecords.map(r => [r.wordSense.id, r.fsrsParams]));

  // topicMapper.toResponse(topic, progressMap) replaces the inline ORM→DTO mapping
  return this.topicMapper.toResponse(topic, progressMap);
}
```

> **`AddTopicWordHandler` response:** After dropping `TopicWord.status`, the `TopicWordDto` `status` field is derived from `FsrsParameters.state` at response time. When a word is freshly added to a topic, the associated `UserWordSenseProgress` has `state = 'new'` (from `FsrsParameters.newCardDefaults()`), so `status = 'NEW'` in the response — no special case needed. The mapper derives this in `toResponse()` from the `progressMap`.

`TopicWord.updateStatus()` is **removed** from the domain entity — it is no longer called and has no purpose without a stored `status` field.

---

## Migration Plan

### Phase 1 — Schema Changes

**Add FSRS columns to `user_word_sense_progress`:**
```sql
ALTER TABLE user_word_sense_progress
  ADD COLUMN stability         FLOAT     NOT NULL DEFAULT 0,
  ADD COLUMN difficulty       FLOAT     NOT NULL DEFAULT 0,
  ADD COLUMN lapses           INT       NOT NULL DEFAULT 0,
  ADD COLUMN reps             INT       NOT NULL DEFAULT 0,
  ADD COLUMN state            VARCHAR(20) NOT NULL DEFAULT 'new',
  ADD COLUMN due_date         TIMESTAMPTZ NULL,                          -- null for new/unreviewed cards
  ADD COLUMN last_review_date TIMESTAMPTZ NULL;
```

**Add `word_sense_id` column to `flashcards` (for hybrid model):**
```sql
ALTER TABLE flashcards
  ADD COLUMN word_sense_id UUID NULL REFERENCES word_senses(id);
CREATE UNIQUE INDEX ON flashcards(word_sense_id) WHERE word_sense_id IS NOT NULL;
```

### Phase 2 — Backfill

- Run backfill script: for each `user_word_sense_progress` record, initialize `FsrsParameters.newCardDefaults()` and write to new columns. Set `due_date = NOW()`.
- Run link script: for each flashcard with `source = 'dictionary'`, backfill `word_sense_id` from the existing `flashcard_word_sense` junction table (if exists) or from `Flashcard.wordSenseId`.

### Phase 3 — Application Code (new state)

- Implement new `UserWordSenseProgress` with `FsrsParameters`, `applyReview()`, new domain events
- Move `FsrsSchedulerService`, `ReviewRating`, `FsrsParameters` VOs to `progress` module
- Implement `ReviewWordHandler`
- Refactor `ReviewCardHandler`

### Phase 4 — Cut Over

- Deploy new application code
- New API writes go exclusively to the new FSRS columns (no dual-write)
- `UserWordSenseProgress.rehydrate()` reads the new columns; legacy columns (`masteryLevel`, `reviewCount`, `nextReviewAt`, `lastReviewedAt`) are read in `toResponse()` as derived values during the transition window (Phase 5 cleanup drops them)
- Monitor for errors; rollback if critical regressions occur

### Phase 5 — Cleanup

- Drop `masteryLevel`, `reviewCount`, `nextReviewAt`, `lastReviewedAt` columns from `user_word_sense_progress`
- Drop `flashcard_scheduling_states` table
- Drop `flashcard_word_sense` junction table (if replaced by `flashcards.word_sense_id`)
- Remove `status` column from `topic_word_orm_entity`

---

## Module Dependency Graph

```
@core/ddd
    ↑
learning/progress/domain/
  ├── entities/
  │   └── UserWordSenseProgress   ← canonical FSRS aggregate
  ├── value-objects/
  │   ├── FsrsParameters          ← moved from flashcard
  │   ├── ReviewRating            ← moved from flashcard
  │   └── CardState               ← moved from flashcard
  ├── events/
  │   ├── WordLearningStartedEvent
  │   ├── WordLearningRemovedEvent
  │   ├── WordReviewedEvent
  │   └── WordMasteredEvent
  └── services/
      └── FsrsSchedulerService    ← moved from flashcard

learning/progress/application/
  ├── commands/
  │   ├── AddToLearningHandler    ← unchanged
  │   ├── RemoveFromLearningHandler ← unchanged
  │   └── ReviewWordHandler       ← NEW
  └── queries/
      └── (unchanged)

learning/topic/
  └── infrastructure/mappers/
      └── TopicMapper             ← derives TopicWord.status from FsrsParameters

flashcard/domain/
  └── Flashcard                    ← drops FsrsParameters, adds wordSenseId

flashcard/application/
  └── ReviewCardHandler           ← refactored to call UserWordSenseProgress.applyReview()
```

---

## Backwards Compatibility

| Concern | Strategy |
|---|---|
| API `/learning/senses` response | `LearningListItemDto.masteryLevel` computed from `fsrsParams` in mapper — same field, same shape |
| API `/study/review` request/response | Same endpoint, same body/response — `ReviewCardHandler` changes internally only |
| Existing flashcards | Backfilled with `word_sense_id` in migration; scheduling state copied to `UserWordSenseProgress` |
| `TopicWord.status` | Derived at read time — no column exists, client gets `NEW`/`LEARNING`/`MASTERED` from FSRS state |
| Event listeners | `UpdateStudyStatsHandler` listens to `WordReviewedEvent` (renamed from `CardReviewedEvent`) — update payload shape |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Flashcard review changes behavior mid-migration | Backfill scheduling state before cut-over; dual-write during transition |
| `TopicWord.status` computed on every read adds latency | Pagination bounds the lookups; denormalized column can be added later if needed |
| `FsrsSchedulerService` move breaks `FlashcardModule` | Import via `ProgressModule` export; tested in integration |
| Custom flashcards (no word Sense) have no FSRS state | Intentional — custom cards are study-only; their review history is in `ReviewLog` only |
| `CardReviewedEvent` renamed to `WordReviewedEvent` breaks event listeners | Rename + update payload; event listeners updated in same commit |
| `CardState` ValueObject moved to `progress` creates a reverse dependency | `flashcard` imports `CardState` from `progress` — verify no circular `progress → flashcard` path exists before finalizing module imports |
| `ReviewLog` needs `wordSenseId`-based entries for dictionary reviews | Extend `ReviewLog` entity or create variant; update mapper and repository accordingly |
