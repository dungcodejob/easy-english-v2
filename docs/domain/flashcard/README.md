# Flashcard Module — Domain Reference

> Handles user-created flashcard management and spaced repetition review logging.

---

## 1. Overview

The flashcard module manages user-created vocabulary cards and their review history. It operates independently from the dictionary — flashcards are purely user-generated content. The `ReviewLog` entity tracks every individual review for analytics and scheduling.

---

## 2. Entity: `ReviewLog` (Entity)

Records every card review with full FSRS state before and after the review. This is the primary audit trail for spaced repetition.

```typescript
// File: server/src/modules/flashcard/domain/entities/review-log.entity.ts
import { Entity } from '@core/ddd';

/**
 * cardId and wordSenseId are mutually exclusive:
 * - Card review: cardId set, wordSenseId undefined
 * - Dictionary review: wordSenseId set, cardId null
 */
export interface ReviewLogProps {
  cardId: FlashcardId | null;           // FK → Flashcard._id (nullable)
  wordSenseId?: string;                  // FK → Dictionary.WordSense._id
  userId: string;                       // FK → User._id
  tenantId: string;                     // Tenant isolation key
  rating: ReviewRating;                  // 1=Again, 2=Hard, 3=Good, 4=Easy
  previousState: CardState;              // State before this review
  newState: CardState;                   // State after this review
  previousParams: FsrsParameters;        // FSRS state before (stability, difficulty)
  newParams: FsrsParameters;            // FSRS state after
  reviewDurationMs: number;             // Time spent on this review
  reviewedAt: Date;
}

export class ReviewLog extends Entity {
  public cardId: FlashcardId | null;
  public wordSenseId?: string;
  public userId: string;
  public tenantId: string;
  public rating: ReviewRating;
  public previousState: CardState;
  public newState: CardState;
  public previousStability: number;     // Derived from previousParams
  public newStability: number;          // Derived from newParams
  public previousDifficulty: number;     // Derived from previousParams
  public newDifficulty: number;        // Derived from newParams
  public reviewDurationMs: number;
  public reviewedAt: Date;
  // _id (uuid) inherited from Entity base
  // createdAt, updatedAt inherited from Entity base
}
```

**Domain Methods:**
```typescript
static create(props: ReviewLogProps): ReviewLog
static rehydrate(props: { id: string; props: ReviewLogProps; createdAt: Date; updatedAt: Date }): ReviewLog
```

---

## 3. Domain Events

| Event | Trigger | Key Payload |
|-------|---------|-------------|
| `FlashcardCreatedEvent` | Card created | `flashcardId`, `tenantId`, `userId` |
| `FlashcardUpdatedEvent` | Card updated | `flashcardId`, `tenantId`, `changes` |
| `FlashcardDeletedEvent` | Card deleted | `flashcardId`, `tenantId` |

---

## 4. Commands

| Command | Handler | Purpose |
|---------|---------|---------|
| `CreateFlashcardCommand` | `CreateFlashcardHandler` | Create a new user flashcard |
| `UpdateFlashcardCommand` | `UpdateFlashcardHandler` | Update front/back/notes |
| `DeleteFlashcardCommand` | `DeleteFlashcardHandler` | Soft-delete a flashcard |
| `ReviewCardCommand` | `ReviewCardHandler` | Record a card review + update scheduling |

### `CreateFlashcardCommand`

```typescript
// File: server/src/modules/flashcard/application/commands/create-flashcard.command.ts
export class CreateFlashcardCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly front: string,             // Card front text
    public readonly back: string,               // Card back text
    public readonly source: string,              // Source of the card
    public readonly hint?: string,
    public readonly notes?: string,
    public readonly wordSenseId?: string,       // Optional link to dictionary
  ) {}
}
```

### `ReviewCardCommand`

```typescript
// File: server/src/modules/flashcard/application/commands/review-card/review-card.command.ts
export class ReviewCardCommand {
  constructor(
    public readonly cardId: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly rating: ReviewRating,          // 1 | 2 | 3 | 4
    public readonly responseTimeMs: number,
    public readonly sessionId?: string,
  ) {}
}
```

---

## 5. Queries

| Query | Handler | Purpose |
|-------|---------|---------|
| `GetFlashcardsQuery` | `GetFlashcardsQueryHandler` | List all flashcards for a tenant |
| `GetDueCardsQuery` | `GetDueCardsQueryHandler` | Get cards due for review |
| `GetStudyStatsQuery` | `GetStudyStatsQueryHandler` | Get study statistics |

---

## 6. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/flashcards` | JWT | List all flashcards |
| `POST` | `/api/v1/flashcards` | JWT | Create flashcard |
| `PUT` | `/api/v1/flashcards/:id` | JWT | Update flashcard |
| `DELETE` | `/api/v1/flashcards/:id` | JWT | Delete flashcard |

---

## 7. FSRS Integration

The flashcard module delegates scheduling logic to the `learning` module's `FsrsService`. After a `ReviewCardCommand`:

1. `ReviewCardHandler` loads the current `CardProgress`
2. Calls `FsrsService.calculateNext(cardProgress, rating, responseTimeMs)`
3. Updates `CardProgress` with new FSRS parameters
4. Creates `ReviewLog` with before/after state snapshot

---

## 8. Related Documentation

- [Learning Module](../learning/README.md) — Progress tracking and study sessions
- [System Design](../../architecture/system-design.md) — FSRS algorithm details
