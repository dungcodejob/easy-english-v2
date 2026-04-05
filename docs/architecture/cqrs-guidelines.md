# CQRS Guidelines

> Command Query Responsibility Separation patterns and conventions for **Easy English V2**.

---

## 1. Overview

Easy English V2 implements CQRS using `@nestjs/cqrs`. Every operation is classified as either a **Command** (write) or a **Query** (read). This separation makes the codebase easier to reason about, test, and optimize independently.

---

## 2. Command vs Query

| Aspect | Command | Query |
|--------|---------|-------|
| **Purpose** | Change state | Read state |
| **Return value** | `void` or `Result<T>` | `Result<T[]>` or `Result<T>` |
| **Side effects** | Allowed (DB write, event emit) | Forbidden |
| **Naming** | `Verb*Noun*Command` | `Verb*Noun*Query` |
| **Handler** | `*CommandHandler` | `*QueryHandler` |
| **Idempotency** | Preferred (via unique constraints) | Naturally idempotent |

### Examples

```typescript
// Commands — Write operations
CreateWorkspaceCommand
UpdateFlashcardCommand
ReviewCardCommand
DeleteTopicCommand
StartStudySessionCommand

// Queries — Read operations
GetWorkspaceByIdQuery
GetDueCardsQuery
GetTopicDetailQuery
GetStudySessionQuery
GetUserProgressQuery
```

---

## 3. Command Structure

### Command Pattern

```typescript
// command file
export class ReviewCardCommand {
  constructor(
    public readonly flashcardId: string,
    public readonly workspaceId: string,
    public readonly rating: CardRating, // Again(0) | Hard(1) | Good(2) | Easy(3)
    public readonly responseTimeMs: number,
    public readonly userId: string,
  ) {}
}

// handler file
@CommandHandler(ReviewCardCommand)
export class ReviewCardCommandHandler {
  async execute(command: ReviewCardCommand): Promise<Result<void, DomainError>> {
    // 1. Load entity
    const card = await this.cardProgressRepo.findByIdOrThrow(command.flashcardId);
    if (card.workspaceId !== command.workspaceId) {
      return err(new ForbiddenError('Card does not belong to this workspace'));
    }

    // 2. Apply domain logic (FSRS algorithm)
    const updatedProgress = this.fsrsService.calculateNextReview(
      card,
      command.rating,
      command.responseTimeMs,
    );

    // 3. Persist
    await this.cardProgressRepo.save(updatedProgress);

    // 4. Emit domain event
    this.eventEmitter.emit(
      new CardReviewedEvent(card.flashcardId, command.workspaceId, command.rating),
    );

    return ok();
  }
}
```

---

## 4. Query Structure

### Query Pattern

```typescript
// query file
export class GetDueCardsQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly limit: number = 20,
    public readonly topicId?: string,
  ) {}
}

// handler file
@QueryHandler(GetDueCardsQuery)
export class GetDueCardsQueryHandler {
  async execute(query: GetDueCardsQuery): Promise<Result<DueCardView[], DomainError>> {
    const cards = await this.cardProgressRepo.findDueCards({
      workspaceId: query.workspaceId,
      limit: query.limit,
      topicId: query.topicId,
      asOf: new Date(),
    });

    const flashcardIds = cards.map((c) => c.flashcardId);
    const flashcards = await this.flashcardRepo.findByIds(flashcardIds);

    const views = cards.map((card) => {
      const flashcard = flashcards.get(card.flashcardId);
      return new DueCardView(card, flashcard);
    });

    return ok(views);
  }
}
```

---

## 5. Read Models (Views)

Read models (views) are plain TypeScript objects optimized for the consumer (API response, UI):

```typescript
// Plain DTO for API response — not a MikroORM entity
export class DueCardView {
  constructor(
    public readonly progress: CardProgress,
    public readonly flashcard: Flashcard,
    public readonly wordSense?: WordSense,
  ) {}

  get front(): string { return this.flashcard.front; }
  get back(): string { return this.flashcard.back; }
  get notes(): string | null { return this.flashcard.notes; }
  get mediaUrls(): string[] { return this.flashcard.mediaUrls ?? []; }
  get state(): CardState { return this.progress.state; }
  get dueDate(): Date { return this.progress.dueDate; }
}

// Study session view — aggregates multiple entities
export class StudySessionView {
  constructor(
    public readonly session: StudySession,
    public readonly cards: DueCardView[],
    public readonly summary: SessionSummaryView,
  ) {}

  get isComplete(): boolean { return this.cards.length === 0; }
  get progress(): { current: number; total: number } {
    return { current: this.session.currentIndex, total: this.cards.length };
  }
}
```

---

## 6. Handler Registration

Commands and queries are auto-discovered by NestJS's DI container:

```
Module
  └── CQRSModule (global, imported in AppModule)
          │
          ├── Commands
          │     └── CommandHandler (registered via @CommandHandler decorator)
          │
          └── Queries
                └── QueryHandler (registered via @QueryHandler decorator)

Controller
  └── calls: this.commandBus.execute(command)
  └── calls: this.queryBus.execute(query)
```

### Dispatching from Controllers

```typescript
@Controller('study')
export class StudyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('reviews')
  async reviewCard(@Body() dto: ReviewCardDto): Promise<ApiResponse<void>> {
    const result = await this.commandBus.execute(
      new ReviewCardCommand(
        dto.flashcardId,
        dto.workspaceId,
        dto.rating,
        dto.responseTimeMs,
        dto.userId,
      ),
    );

    return result.match(
      () => ApiResponse.success(),
      (error) => { throw new DomainException(error); },
    );
  }

  @Get('due-cards')
  async getDueCards(@Query() dto: GetDueCardsDto): Promise<ApiResponse<DueCardView[]>> {
    const result = await this.queryBus.execute(
      new GetDueCardsQuery(dto.workspaceId, dto.limit, dto.topicId),
    );

    return result.match(
      (cards) => ApiResponse.success(cards),
      (error) => { throw new DomainException(error); },
    );
  }
}
```

---

## 7. Result Type Pattern

All command and query handlers return `Result<T, E>` from the `neverthrow` library. This makes error handling explicit and forces callers to handle failures.

```typescript
import { Result, ok, err } from 'neverthrow';

// Domain errors extend AppError
class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
  }
}

// Concrete domain errors
class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, { resource, id });
  }
}

class ForbiddenError extends AppError {
  constructor(message: string) {
    super('FORBIDDEN', message);
  }
}

class ValidationError extends AppError {
  constructor(message: string, public readonly details: string[]) {
    super('VALIDATION_ERROR', message, { details });
  }
}
```

Usage in handlers:

```typescript
async execute(command: ReviewCardCommand): Promise<Result<CardProgress, DomainError>> {
  // Happy path
  return ok(updatedCard);

  // Error path — no exceptions thrown
  return err(new NotFoundError('CardProgress', command.flashcardId));
}
```

---

## 8. Event-Driven Side Effects

Commands emit domain events for async side effects. Events are handled by `@EventHandler` decorated methods:

```typescript
// Domain event
export class CardReviewedEvent {
  constructor(
    public readonly cardId: string,
    public readonly workspaceId: string,
    public readonly rating: CardRating,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

// Event handler (in same module or separate listener module)
@EventHandler(CardReviewedEvent)
export class CardReviewedEventHandler {
  async handle(event: CardReviewedEvent): Promise<void> {
    await this.statsService.recordReview(event.workspaceId, event.rating);

    if (event.rating === CardRating.Again) {
      await this.notificationService.scheduleReminder(
        event.workspaceId,
        event.cardId,
        60, // 1 minute
      );
    }
  }
}
```

---

## 9. CQRS Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         Client Request                             │
│                    POST /api/v1/study/reviews                     │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                         Controller                                 │
│                     ReviewCardController                           │
└────────────────────────────┬───────────────────────────────────────┘
                             │
             ┌───────────────┴───────────────┐
             │                               │
             ▼                               ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│       CommandBus       │       │        QueryBus         │
│    (writes only)        │       │     (reads only)        │
└────────────┬────────────┘       └────────────┬────────────┘
             │                                 │
             ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│  ReviewCardCommand     │       │   GetDueCardsQuery      │
│  Handler               │       │   Handler               │
│                        │       │                         │
│  1. Validate input     │       │  1. Check cache         │
│  2. Load entity        │       │  2. Query DB            │
│  3. Apply FSRS         │       │  3. Map to view         │
│  4. Persist changes    │       │  4. Return view        │
│  5. Emit event         │       │                         │
└────────────┬────────────┘       └────────────┬────────────┘
             │                                 │
             ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│  Domain Events          │       │  DueCardView[]         │
│  CardReviewedEvent      │       │  (read model)          │
└────────────┬────────────┘       └─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│  Event Handlers         │
│  (async, decoupled)     │
│  • Update stats         │
│  • Schedule reminders    │
│  • Audit log            │
└─────────────────────────┘
```

---

## 10. Best Practices

| Rule | Reason |
|------|--------|
| Commands return `Result<T, E>`, never throw | Forces explicit error handling |
| Queries are pure — no side effects | Easy to cache, test, and reason about |
| One handler per command/query class | Single responsibility |
| Use Value Objects for constrained types | e.g., `CardRating`, `WorkspaceId` |
| Emit events from commands only | Ensures all state changes are traced |
| Don't query in commands | Use repository find-then-save pattern |
| Don't mutate in queries | Queries return read-only views |

---

## 11. Related Documentation

- [Architecture Overview](./architecture-overview.md) — System map
- [Module Structure](./module-structure.md) — How modules organize CQRS
- [Domain Documentation](../domain/) — Real command/query examples per module
