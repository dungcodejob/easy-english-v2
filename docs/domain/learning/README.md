# Learning Module — Domain Reference

> Handles learning progress, study sessions, and topic management. The most complex module in the system.

---

## 1. Overview

The learning module is divided into three sub-domains:

| Sub-Domain | Purpose | Entities |
|-----------|---------|----------|
| `progress` | Word learning progress tracking | `UserWordSenseProgress` |
| `study` | Study sessions and review scheduling | `StudySession`, `StudyReviewLog` |
| `topic` | User-organized word groups | `Topic`, `TopicWord` |

---

## 2. Entities

### 2.1 `UserWordSenseProgress` (Aggregate Root)

Tracks the learning state of a single word (dictionary `WordSense`) for a specific user. Uses the FSRS (Free Spaced Repetition Scheduler) algorithm for optimal review scheduling.

```typescript
// File: server/src/modules/learning/progress/domain/entities/user-word-sense-progress.entity.ts
import { AggregateRoot } from '@core/ddd';

export class UserWordSenseProgress extends AggregateRoot {
  private _userId!: string;                    // FK → User._id
  private _tenantId!: string;                   // Tenant isolation key
  private _wordSenseId!: string;                // FK → Dictionary.WordSense._id
  private _fsrsParams!: FsrsParameters;         // Core scheduling state

  // Legacy fields — phased out in Phase 4/5
  private _masteryLevel!: number;               // 0-100, derived from stability
  private _reviewCount!: number;
  private _nextReviewAt!: Date;
  private _lastReviewedAt!: Date | null;

  private _archivedAt!: Date | null;           // null = active, set = removed from learning

  // Derived state
  get isArchived(): boolean                   // _archivedAt !== null
  get isMastered(): boolean                  // stability >= 30 && no lapses
  get isDue(): boolean                       // dueDate !== null && dueDate <= now
  // _id (uuid) inherited from Entity base
  // createdAt, updatedAt inherited from Entity base
}
```

**Core FSRS Fields (inside `FsrsParameters`):**
```typescript
interface FsrsParameters {
  stability: number;       // How reliable memory is (higher = longer intervals)
  difficulty: number;     // How hard the card is (0.0–1.0)
  dueDate: Date | null;   // Next scheduled review date
  lastReviewDate: Date | null;
  state: CardState;       // New | Learning | Review | Relearning
}
```

**Domain Methods:**
```typescript
static create(props: { userId, tenantId, wordSenseId }): UserWordSenseProgress
static rehydrate(props: RehydrateProps & { fsrsParams: FsrsParameters }): UserWordSenseProgress
applyReview(rating: ReviewRating, newParams: FsrsParameters, reviewDurationMs: number, sessionId?: string): void
archive(): void       // Remove from learning (emits WordLearningRemovedEvent)
restore(): void      // Restore archived word
```

**Events Emitted:**
- `WordLearningStartedEvent` — on creation
- `WordReviewedEvent` — on `applyReview()`, includes previous/new FSRS params
- `WordMasteredEvent` — when word becomes mastered (stability >= 30)
- `WordLearningRemovedEvent` — on `archive()`

---

### 2.2 `StudySession` (Aggregate Root)

Represents a single study session — a bounded period of reviewing cards.

```typescript
// File: server/src/modules/learning/study/domain/entities/study-session.entity.ts
import { AggregateRoot } from '@core/ddd';

// Scoping: which cards are enrolled in this session
export const studySessionScope = {
  Due: 'Due',     // All due cards (default)
  Topic: 'Topic', // Cards from a specific topic
} as const;
export type StudySessionScope = ObjectValues<typeof studySessionScope>;

// Study type
export const studySessionType = {
  Flashcard: 'Flashcard',
  Quiz: 'Quiz',
} as const;
export type StudySessionType = ObjectValues<typeof studySessionType>;

// Session status
export const studySessionStatus = {
  InProgress: 'InProgress',
  Completed: 'Completed',
  Abandoned: 'Abandoned',
} as const;
export type StudySessionStatus = ObjectValues<typeof studySessionStatus>;

export class StudySession extends AggregateRoot {
  private _userId!: string;
  private _tenantId!: string;
  private _scope!: StudySessionScope;
  private _studyType!: StudySessionType;
  private _topicId!: string | null;          // null unless scope === Topic
  private _enrolledCardIds!: string[];       // Cards to review in this session
  private _reviewedCount!: number;
  private _againCount!: number;
  private _hardCount!: number;
  private _goodCount!: number;
  private _easyCount!: number;
  private _status!: StudySessionStatus;
  private _startedAt!: Date;
  private _completedAt!: Date | null;
  private _abandonedAt!: Date | null;
  // _id (uuid) inherited from Entity base
}
```

**Domain Methods:**
```typescript
static create(props: {
  userId, tenantId, scope, topicId, studyType, enrolledCardIds
}): StudySession
static rehydrate(props: RehydrateProps): StudySession
includesCard(wordSenseId: string): boolean
recordReview(rating: 1 | 2 | 3 | 4): void
complete(now?: Date): void                   // Emits StudySessionCompletedEvent
```

**Events Emitted:**
- `StudySessionStartedEvent` — on creation with `enrolledCardCount`, `scope`, `studyType`
- `StudySessionCompletedEvent` — on `complete()` with full review stats

---

### 2.3 `TopicWord` (Entity)

A child entity representing a word added to a topic. Note: its `_status` field is a **placeholder** — the real status is derived from `UserWordSenseProgress` at read time.

```typescript
// File: server/src/modules/learning/topic/domain/entities/topic-word.entity.ts

export class TopicWord {
  private _id!: string;                       // UUID
  private _wordSenseId!: string;             // FK → Dictionary.WordSense._id
  private _addedAt!: Date;

  // NOTE: _status is placeholder ONLY. Real status comes from UserWordSenseProgress at read time.
  private _status: WordLearningStatus;       // Always NEW after rehydration

  static create(wordSenseId: string): TopicWord
  static rehydrate(id: string, wordSenseId: string, addedAt: Date): TopicWord
}
```

---

## 3. Domain Events

### Progress Sub-Domain

| Event | Trigger | Key Payload |
|-------|---------|-------------|
| `WordLearningStartedEvent` | Word added to learning | `wordSenseId`, `userId`, `tenantId` |
| `WordReviewedEvent` | Review applied | `wordSenseId`, `rating`, `previousParams`, `newParams` |
| `WordMasteredEvent` | Stability hits threshold | `wordSenseId`, `userId`, `tenantId` |
| `WordLearningRemovedEvent` | Word archived | `wordSenseId`, `userId`, `tenantId` |

### Study Sub-Domain

| Event | Trigger | Key Payload |
|-------|---------|-------------|
| `StudySessionStartedEvent` | Session created | `sessionId`, `enrolledCardCount`, `scope`, `studyType` |
| `StudySessionCompletedEvent` | Session completed | `sessionId`, `reviewedCount`, rating breakdown |

### Topic Sub-Domain

| Event | Trigger | Key Payload |
|-------|---------|-------------|
| `TopicCreatedEvent` | Topic created | `topicId`, `userId`, `tenantId` |
| `TopicUpdatedEvent` | Topic updated | `topicId`, `changes` |
| `TopicDeletedEvent` | Topic deleted | `topicId` |
| `TopicWordAddedEvent` | Word added to topic | `topicId`, `wordSenseId` |
| `TopicWordRemovedEvent` | Word removed from topic | `topicId`, `wordSenseId` |

---

## 4. Commands

| Sub-Domain | Command | Handler | Purpose |
|-----------|---------|---------|---------|
| progress | `AddToLearningCommand` | `AddToLearningHandler` | Add word to learning |
| progress | `RemoveFromLearningCommand` | `RemoveFromLearningHandler` | Archive progress |
| progress | `ReviewWordCommand` | `ReviewWordHandler` | Apply review to word |
| study | `StartStudySessionCommand` | `StartStudySessionHandler` | Create new session |
| study | `StudySessionReviewCommand` | `StudySessionReviewHandler` | Record review in session |
| study | `CompleteStudySessionCommand` | `CompleteStudySessionHandler` | Mark session complete |
| topic | `CreateTopicCommand` | `CreateTopicHandler` | Create topic |
| topic | `UpdateTopicCommand` | `UpdateTopicHandler` | Update topic name |
| topic | `DeleteTopicCommand` | `DeleteTopicHandler` | Delete topic |
| topic | `AddTopicWordCommand` | `AddTopicWordHandler` | Add word to topic |
| topic | `RemoveTopicWordCommand` | `RemoveTopicWordHandler` | Remove word from topic |

### Key Command Examples

```typescript
// StartStudySession
export class StartStudySessionCommand {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly scope: StudySessionScope,
    public readonly topicId: string | null,
    public readonly studyType: StudySessionType,
  ) {}
}

// AddToLearning
export class AddToLearningCommand {
  constructor(
    public readonly wordSenseId: string,
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}

// ReviewWord (dictionary-level, no card)
export class ReviewWordCommand {
  constructor(
    public readonly wordSenseId: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly rating: ReviewRating,
    public readonly responseTimeMs: number,
  ) {}
}
```

---

## 5. Queries

| Sub-Domain | Query | Handler | Purpose |
|-----------|-------|---------|---------|
| progress | `GetLearningListQuery` | `GetLearningListHandler` | List words in learning |
| progress | `GetLearningStateQuery` | `GetLearningStateHandler` | Get overall learning state |
| study | `GetDueCardsQuery` | `GetDueCardsHandler` | Get due cards for session |
| study | `GetSessionSummaryQuery` | `GetSessionSummaryHandler` | Get session statistics |
| study | `GetTopicCardsQuery` | `GetTopicCardsHandler` | Get cards for topic study |
| topic | `GetTopicsQuery` | `GetTopicsHandler` | List all topics |
| topic | `GetTopicDetailQuery` | `GetTopicDetailHandler` | Get topic with words |
| topic | `ListTopicWordsQuery` | `ListTopicWordsHandler` | List words in topic |

---

## 6. API Endpoints

### Learning Progress

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/learning/state` | JWT | Get learning dashboard state |
| `GET` | `/api/v1/learning/list` | JWT | List words in learning |

### Study

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/learning/study/due` | JWT | Get due study cards |
| `GET` | `/api/v1/learning/study/topic/:topicId` | JWT | Get topic study cards |

### Topics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/topics` | JWT | List all topics |
| `POST` | `/api/v1/topics` | JWT | Create topic |
| `GET` | `/api/v1/topics/:id` | JWT | Get topic detail |
| `PUT` | `/api/v1/topics/:id` | JWT | Update topic |
| `DELETE` | `/api/v1/topics/:id` | JWT | Delete topic |
| `POST` | `/api/v1/topics/:id/words` | JWT | Add word to topic |
| `DELETE` | `/api/v1/topics/:id/words/:wordId` | JWT | Remove word from topic |

---

## 7. Related Documentation

- [Architecture Overview](../../architecture/architecture-overview.md) — System map
- [CQRS Guidelines](../../architecture/cqrs-guidelines.md) — Command/query patterns
- [Flashcard Module](../flashcard/README.md) — Card-level review
