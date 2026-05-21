# Learning Module — Tài liệu Nghiệp vụ

> Handles learning progress, study sessions, and topic management. The most complex module in the system.
> **Updated:** 2026-04-06

---

## 1. Tổng quan kiến trúc

### 1.1 Hai modules liên quan — Hệ thống học tập song song

Dự án có **2 modules riêng biệt** cùng phục vụ nghiệp vụ học tập:

```
server/src/modules/
├── learning/           # Nghiệp vụ học từ vựng (dictionary-based)
│   ├── topic/          # Quản lý chủ đề (flashcard deck)
│   ├── progress/       # Spaced repetition engine (FSRS)
│   └── study/          # Study sessions orchestration
│
└── flashcard/          # Nghiệp vụ flashcard tự tạo (custom cards)
    └── Hoàn toàn độc lập, KHÔNG phụ thuộc learning/topic
```

| Khía cạnh | `learning/` (Dictionary-based) | `flashcard/` (Custom cards) |
|---|---|---|
| **Nguồn từ** | WordSense từ dictionary module | User tự tạo (front/back/hint/notes) |
| **Tổ chức** | Topic (deck), max 50 topics, max 200 words/topic | Không có deck — cards phẳng theo user |
| **Spaced repetition** | `UserWordSenseProgress` + `FsrsSchedulerService` | `flashcard.fsrsParams` + `FsrsSchedulerService` |
| **Scheduling** | `dueDate` in `user_word_sense_progress` | `dueDate` in `flashcards` |
| **Tracking** | `UserWordSenseProgress` (mastery, review count) | `ReviewLog` + `StudyStats` |
| **Study session** | `StudySession` aggregate trong `learning/study` | `StudyController` riêng trong `flashcard/` |

### 1.2 Ba sub-domains trong `learning/`

| Sub-Domain | Purpose | Entities |
|------------|---------|----------|
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

## 8. Luồng nghiệp vụ chi tiết (Business Flows)

### Flow 1: Thêm từ vào danh sách học

```
User duyệt dictionary → chọn wordSense
  → POST /api/v1/learning/senses { wordSenseId }
  → AddToLearningHandler.execute()
    ├── Tìm UserWordSenseProgress hiện tại
    │   ├── Đã archive? → restore()
    │   └── Chưa có? → create() với state=NEW, stability ban đầu
    └── Emit WordLearningStartedEvent
  → Trả về progress record (isDue=true, masteryLevel=0)
```

### Flow 2: Học due cards (dictionary-based)

```
User nhấn "Học bài"
  → GET /api/v1/learning/study/due
    → GetDueCardsHandler: archivedAt=null && dueDate<=now
    → Deduplicate by wordSenseId, cap 100

Hoặc bắt đầu session:
  → POST /api/v1/learning/study/session/start { scope=DUE }
    → Tạo StudySession (InProgress)
    → Emit StudySessionStartedEvent
```

### Flow 3: Học theo chủ đề (topic-based)

```
User chọn Topic → nhấn "Học chủ đề này"
  → GET /api/v1/learning/study/topic/:topicId
    → Lấy TopicWord[] → join UserWordSenseProgress
    → Deduplicate, chỉ lấy active progress, cap 100

Hoặc bắt đầu session:
  → POST /api/v1/learning/study/session/start
    { scope=TOPIC, topicId, studyType=FLASHCARD|QUIZ }
```

### Flow 4: Quiz mode (4 đáp án)

```
POST /api/v1/learning/study/session/start
  { scope=DUE|TOPIC, studyType=QUIZ }
  → StartStudySessionHandler
  → GetQuizCardsHandler: mỗi card → tìm 3 distractors cùng POS → shuffle → cap 20
User trả lời → POST /api/v1/learning/study/session/review
```

### Flow 5: Review trong session

```
User chọn rating (Again/Hard/Good/Easy)
  → POST /api/v1/learning/study/session/review
    { sessionId, wordSenseId, rating, reviewDurationMs }
  → StudySessionReviewHandler:
    a. Validate: session đúng, card trong enrolledCards
    b. Dispatch ReviewWordCommand
    c. ReviewWordHandler: FsrsSchedulerService.calculateNext() → progress.applyReview()
    d. Emit WordReviewedEvent (with sessionId)
    e. StudySessionReviewLogListener: tạo StudyReviewLog (skip duplicate)
    f. session.recordReview(rating) → cập nhật counts
  → Trả về next card
```

### Flow 6: Review ngoài session (dictionary mode)

```
User đang ở dictionary → nhấn "Đánh giá" trên 1 từ
  → POST /api/v1/learning/senses/:senseId/review { rating, reviewDurationMs }
  → ReviewWordHandler: tính FSRS params → progress.applyReview()
  → Emit WordReviewedEvent (NO sessionId)
  → Trả về { nextDueDate, intervalDays, isMastered }
  ⚠️ Nếu word đã archived → ConflictException(409)
```

### Flow 7: Hoàn thành phiên học

```
User đã review hết cards → nhấn "Kết thúc"
  → POST /api/v1/learning/study/session/:sessionId/complete
  → CompleteStudySessionHandler: session.complete() → emit StudySessionCompletedEvent
  → GET /api/v1/learning/study/session/:sessionId
  → GetSessionSummaryHandler: aggregate StudyReviewLog[] → tính rating breakdown, accuracy %, time spent
```

### Flow 8: Tổ chức từ vào chủ đề

```
User tạo Topic
  → POST /api/v1/topics { name, description }
  → Check 50-limit → Topic.create() → emit TopicCreated

User thêm từ vào Topic
  → POST /api/v1/topics/:id/words { wordSenseId }
  → Check 200-limit + duplicate → Topic.addWord() → emit TopicWordAdded

Đọc words trong Topic
  → GET /api/v1/topics/:id/words
  → ListTopicWordsHandler: join TopicWord + UserWordSenseProgress
  → Derive status (NEW/LEARNING/MASTERED) tại read time
  ⚠️ TopicWord._status bị bỏ qua hoàn toàn
```

### Flow 9: Xóa/hủy học từ

```
DELETE /api/v1/learning/senses/:senseId
  → RemoveFromLearningHandler → progress.archive() (archivedAt = now)
  → Emit WordLearningRemovedEvent
  → Card KHÔNG còn xuất hiện trong due cards

User khôi phục:
  → POST /api/v1/learning/senses { wordSenseId }
  → Tìm thấy archived → progress.restore()
  → Card quay lại danh sách học
```

### Flow 10: Custom Flashcard (standalone)

```
Tạo flashcard:
  → POST /api/v1/flashcards { front, back, hint?, source }
  → Flashcard.create() → save

Lấy due flashcards:
  → GET /api/v1/study/due?limit=N

Review flashcard (standalone, không có session):
  → POST /api/v1/study/review { cardId, rating, durationMs }
  → ReviewCardHandler: FsrsSchedulerService.calculateNext()
  → flashcard.updateFsrsParams() → ReviewLog.create() → studyStats.recordReview()

Xem stats:
  → GET /api/v1/study/stats → Current streak, total reviewed, mastered cards
```

---

## 9. Các câu hỏi đã được giải đáp

### Q1: `studyType = Flashcard` KHÔNG gọi sang flashcard module

**Thực tế:** `studyType = Flashcard` không có logic riêng — rơi vào nhánh default → gọi `GetDueCardsQuery` từ **`UserWordSenseProgress`** table, hoàn toàn không liên quan đến `flashcard` table.

```typescript
// StartStudySessionHandler — routing logic
if (scope === Topic)  → GetTopicCardsQuery
else if (studyType === Quiz) → GetQuizCardsQuery
else  → GetDueCardsQuery (Flashcard + Due đều vào đây)
```

**Hệ quả:** Có 2 hệ thống học hoàn toàn tách biệt:
- `StudySession` + `UserWordSenseProgress` → dictionary-based learning
- Flashcard `StudyController` → custom flashcard learning (standalone)

### Q2: KHÔNG có conflict routing — nhưng có naming confusion

**Thực tế:** Paths hoàn toàn khác nhau nên không có routing conflict:
- `/api/v1/study` → FlashcardModule/StudyController
- `/api/v1/learning/study` → StudyModule/StudyController

**Tuy nhiên** developer/client dễ nhầm 2 hệ thống. Đề xuất: đổi `/api/v1/study` → `/api/v1/flashcards/study`.

### Q3: Hệ thống update cả hai

**Thực tế:** Khi `flashcard.source = 'dictionary'` + có `wordSenseId`, `ReviewCardHandler`:
1. Tìm `UserWordSenseProgress` theo `wordSenseId`
2. Lấy FSRS params hiện tại từ progress
3. Tính FSRS params tiếp theo
4. `progress.applyReview()` → cập nhật `UserWordSenseProgress`
5. Tạo `ReviewLog` với đầy đủ thông tin cả 2 worlds

→ Không cần thay đổi.

### Q4: Silent skip — graceful design

**Thực tế:** `StudySessionReviewLogListener` có guard `if (!event.sessionId) return;` → silent skip khi review ngoài session. ReviewLog (flashcard module) vẫn được tạo đầy đủ → audit trail vẫn có.

→ Không cần thay đổi.

### Đề xuất cải thiện

1. **Q1 — Chọn 1 trong 2:**
   - Option A: Thêm branch trong `StartStudySessionHandler` để gọi sang `flashcard.module` khi `studyType = Flashcard`
   - Option B: Giữ 2 hệ thống riêng biệt là design chủ đích, document rõ ràng

2. **Q2 — Rename flashcard routes:**
   - Đổi `/api/v1/study` → `/api/v1/flashcards/study` để tránh confusion

---

## 10. Tóm tắt nhanh

```
Learning = Dictionary-based vocabulary learning
Flashcard = Custom card learning (standalone)

Dictionary learning flow:
  Dictionary → [Add to Learning] → Progress (FSRS)
                              ↓
  [Study Due] ←→ StudySession → Review → FSRS Update
                              ↓
                        Session Summary

Topic flow:
  Topics (deck) → [Study Topic] → StudySession → Review → FSRS
              ↓
         Word Status (derived from Progress)

Custom flashcard flow:
  Create Flashcard → Due Cards → Review → FSRS Update
                  ↓
              Study Stats
```

---

## 11. Related Documentation

- [Architecture Overview](../../architecture/architecture-overview.md) — System map
- [CQRS Guidelines](../../architecture/cqrs-guidelines.md) — Command/query patterns
- [Flashcard Module](../flashcard/README.md) — Card-level review
- [Study API](../../api/study.md) — REST API reference
