# Module Structure

> DDD module conventions, boundaries, and organization for **Easy English V2**.

---

## 1. Overview

Each server module represents a **bounded context** in the domain. Modules follow a strict internal structure that separates concerns: domain logic (entities, value objects), application logic (commands, queries), infrastructure (persistence), and presentation (controllers).

---

## 2. Module Anatomy

Each module lives in `server/src/modules/<module-name>/` and is organized into four layers:

```
server/src/modules/<module-name>/
│
├── domain/                        # Pure domain — no framework imports
│   ├── entities/                  # Domain entities
│   │   └── <name>.entity.ts
│   ├── value-objects/             # Immutable value types
│   │   └── <name>.vo.ts
│   ├── repositories/               # Repository interfaces (abstractions)
│   │   └── <name>.repository.ts
│   ├── services/                  # Domain services (if needed)
│   │   └── <name>.service.ts
│   └── events/                    # Domain events
│       └── <name>.event.ts
│
├── application/                   # Use cases — commands & queries
│   ├── commands/                  # Write operations
│   │   ├── <name>.command.ts
│   │   └── <name>.handler.ts
│   └── queries/                   # Read operations
│       ├── <name>.query.ts
│       └── <name>.handler.ts
│
├── infrastructure/                # Framework-specific implementations
│   ├── persistence/               # Repository implementations
│   │   └── <name>.repository.ts
│   ├── orm-entities/              # MikroORM entity decorators
│   │   └── <name>.orm-entity.ts
│   └── services/                  # External service integrations
│
└── presentation/                  # API layer — HTTP entry points
    ├── dto/                       # Request/response DTOs
    │   ├── create-<name>.dto.ts
    │   └── <name>.response.dto.ts
    ├── controllers/
    │   └── <name>.controller.ts
    └── <module-name>.module.ts    # NestJS module definition
```

### Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| Domain entity | `*.entity.ts` | `flashcard.entity.ts` |
| ORM entity | `*.orm-entity.ts` | `flashcard.orm-entity.ts` |
| Value object | `*.vo.ts` | `card-rating.vo.ts` |
| Repository interface | `*.repository.ts` | `flashcard.repository.ts` |
| Repository impl | `*.repository.ts` (infra) | `flashcard.repository.ts` |
| Command | `*Command.ts` | `CreateFlashcardCommand.ts` |
| Command handler | `*CommandHandler.ts` | `CreateFlashcardHandler.ts` |
| Query | `*Query.ts` | `GetFlashcardByIdQuery.ts` |
| Query handler | `*QueryHandler.ts` | `GetFlashcardByIdHandler.ts` |
| Domain event | `*Event.ts` | `CardReviewedEvent.ts` |
| Create DTO | `create-*.dto.ts` | `create-flashcard.dto.ts` |
| Response DTO | `*.response.dto.ts` | `flashcard.response.dto.ts` |
| Controller | `*.controller.ts` | `flashcard.controller.ts` |

---

## 3. Module Dependency Rules

Modules can only depend on modules below them in the dependency hierarchy:

```
auth ──────► workspace
             │
             ▼
        learning ◄──── flashcard
             │
             ▼
         dictionary
```

**Dependency direction**: `auth` → `workspace` means `workspace` imports nothing from `auth`. Higher modules define interfaces; lower modules implement them.

- `flashcard` exports its repository token; `learning/study` imports it to query cards during sessions.
- `learning/progress` exports its FSRS scheduler; `flashcard` imports it to calculate review intervals.

### Shared Kernel

A minimal `shared-kernel` module holds value objects shared across boundaries:

```
server/src/shared-kernel/
├── value-objects/
│   ├── workspace-id.vo.ts
│   ├── user-id.vo.ts
│   └── entity-id.vo.ts
└── types/
    └── result.ts       # Re-exports neverthrow Result type
```

Modules import from `shared-kernel` freely — it has zero dependencies.

---

## 4. Module Examples

### Flashcard Module (`/modules/flashcard`)

The `flashcard` module owns the flashcard aggregate and its review log. It depends on `learning/progress` for FSRS scheduling and exports its repository token for use by `learning/study`.

```
server/src/modules/flashcard/
│
├── domain/
│   └── entities/
│       └── flashcard.entity.ts          # Flashcard aggregate root
│
├── application/
│   ├── commands/
│   │   ├── create-flashcard/
│   │   │   ├── create-flashcard.command.ts
│   │   │   └── create-flashcard.handler.ts
│   │   ├── update-flashcard/
│   │   ├── delete-flashcard/
│   │   └── review-card/                 # Calls FsrsSchedulerService from learning/progress
│   │
│   └── queries/
│       └── get-flashcards/
│
├── infrastructure/
│   ├── persistence/
│   │   └── flashcard.repository.ts      # MikroORM implementation
│   └── orm-entities/
│       ├── flashcard.orm-entity.ts
│       └── review-log.orm-entity.ts
│
└── presentation/
    ├── dto/
    │   ├── create-flashcard.dto.ts
    │   ├── update-flashcard.dto.ts
    │   └── flashcard.response.dto.ts
    ├── controllers/
    │   └── flashcard.controller.ts
    └── flashcard.module.ts              # Exports: FlashcardMapper, flashcardRepositoryToken
```

### Learning Module (`/modules/learning`)

The `learning` module is a composite of three sub-modules: `progress`, `topic`, and `study`.

```
server/src/modules/learning/
│
├── progress/                            # FSRS state machine for word-sense learning
│   ├── domain/entities/
│   │   └── user-word-sense-progress.entity.ts
│   ├── application/
│   │   ├── commands/                    # AddToLearning, RemoveFromLearning, ReviewWord
│   │   └── queries/                     # GetLearningState, GetLearningList, GetLearnedStatus
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── learning-read.repository.ts
│   │   │   └── learning-write.repository.ts
│   │   ├── orm-entities/
│   │   │   └── user-word-sense-progress.orm-entity.ts
│   │   └── services/
│   │       └── fsrs-scheduler.service.ts   # FSRS algorithm
│   └── presentation/
│       ├── senses.controller.ts
│       └── progress.module.ts              # Exports: FsrsSchedulerService, read/write repos
│
├── topic/                               # User-created word groups
│   ├── domain/entities/
│   │   └── topic.entity.ts
│   ├── application/
│   │   ├── commands/                    # CreateTopic, UpdateTopic, DeleteTopic
│   │   └── queries/                     # GetTopics, GetTopicDetail
│   ├── infrastructure/
│   │   └── persistence/
│   │       └── topic.repository.ts
│   └── presentation/
│       └── topic.controller.ts
│
├── study/                               # Study sessions, quiz cards, statistics
│   ├── application/
│   │   ├── commands/                    # StartStudySession, StudySessionReview, CompleteStudySession
│   │   └── queries/                     # GetDueCards, GetQuizCards, GetTopicCards, GetStudyStats
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── study-session.repository.ts
│   │   │   └── study-stats.repository.ts
│   │   └── orm-entities/
│   │       ├── study-session.orm-entity.ts
│   │       ├── study-review-log.orm-entity.ts
│   │       └── study-stats.orm-entity.ts
│   └── presentation/
│       ├── study.controller.ts
│       └── study-session.controller.ts
│
└── learning.module.ts                   # Root module composing progress + topic + study
```

---

## 5. Domain Entity Pattern

Domain entities are pure TypeScript — no NestJS decorators or framework imports:

```typescript
// domain/entities/flashcard.entity.ts
export class Flashcard {
  constructor(
    private readonly _id: FlashcardId,
    private readonly _workspaceId: WorkspaceId,
    private _front: FlashcardContent,
    private _back: FlashcardContent,
    private _notes: FlashcardNotes | null,
    private _mediaUrls: MediaUrl[],
    private _wordSenseId: WordSenseId | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Immutable read accessors
  get id(): FlashcardId { return this._id; }
  get workspaceId(): WorkspaceId { return this._workspaceId; }
  get front(): FlashcardContent { return this._front; }
  get back(): FlashcardContent { return this._back; }

  // Mutable operations — domain methods
  updateContent(front: FlashcardContent, back: FlashcardContent): void {
    this._front = front;
    this._back = back;
    this._updatedAt = new Date();
  }

  updateNotes(notes: FlashcardNotes | null): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  // Factory method — controlled creation
  static create(props: CreateFlashcardProps): Flashcard {
    return new Flashcard(
      FlashcardId.generate(),
      props.workspaceId,
      new FlashcardContent(props.front),
      new FlashcardContent(props.back),
      props.notes ? new FlashcardNotes(props.notes) : null,
      props.mediaUrls.map((u) => new MediaUrl(u)),
      props.wordSenseId ? WordSenseId.from(props.wordSenseId) : null,
      new Date(),
      new Date(),
    );
  }
}
```

---

## 6. ORM Entity Pattern

ORM entities extend domain entities and add persistence decorators:

```typescript
// infrastructure/orm-entities/flashcard.orm-entity.ts
@Embeddable({ class: FlashcardContent })
export class FlashcardContentEmbeddable {
  @Property()
  plainText!: string;

  @Property({ type: 'text' })
  html!: string;
}

@Entity({ tableName: 'flashcard' })
@FilterDefinition({ name: 'tenant', cond: { workspaceId: '$_workspaceId' } })
export class FlashcardOrmEntity extends Flashcard {
  @PrimaryKey({ type: 'uuid' })
  _id!: string;

  @Property({ type: 'uuid' })
  _workspaceId!: string;

  @Embedded({ entity: () => FlashcardContentEmbeddable, prefix: 'content_' })
  _content!: FlashcardContentEmbeddable;

  @Property({ type: 'text', nullable: true })
  _notes?: string;

  @Property({ type: 'json', serializer: JSON.stringify })
  _mediaUrls: string[] = [];

  @Property({ type: 'uuid', nullable: true })
  _wordSenseId?: string;

  @Property()
  _createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  _updatedAt!: Date;

  // Mapping from domain entity getters to ORM columns
  get id(): FlashcardId { return FlashcardId.from(this._id); }
  get workspaceId(): WorkspaceId { return WorkspaceId.from(this._workspaceId); }
  get front(): FlashcardContent { return new FlashcardContent(this._content.plainText); }
}
```

---

## 7. Module NestJS Wiring

```typescript
// flashcard.module.ts — owns the flashcard aggregate
@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([FlashcardOrmEntity, ReviewLogOrmEntity]),
    ProgressModule,          // Imports FsrsSchedulerService for review scheduling
  ],
  controllers: [FlashcardController],
  providers: [
    CreateFlashcardHandler,
    UpdateFlashcardHandler,
    DeleteFlashcardHandler,
    ReviewCardHandler,
    GetFlashcardsHandler,
    { provide: flashcardRepositoryToken, useClass: FlashcardRepository },
    { provide: ReviewLogRepositoryToken, useClass: ReviewLogRepository },
    FlashcardMapper,
  ],
  exports: [FlashcardMapper, flashcardRepositoryToken, ReviewLogRepositoryToken],
})
export class FlashcardModule {}

// learning.module.ts — composes progress + topic + study sub-modules
@Module({
  imports: [ProgressModule, TopicModule, StudyModule],
})
export class LearningModule {}
```

---

## 8. Module Boundaries Checklist

| Check | Description |
|-------|-------------|
| ☐ No circular dependencies | Module A never imports Module B while B imports A |
| ☐ Domain layer is pure | No `@Injectable()`, MikroORM, or NestJS decorators |
| ☐ Repositories are interfaces | Infrastructure implementations are injected via DI |
| ☐ Events are plain classes | No framework coupling in domain events |
| ☐ DTOs are presentation-only | Controllers transform entities → DTOs |
| ☐ Aggregate boundaries respected | Cross-aggregate operations go through domain services |

---

## 9. Related Documentation

- [CQRS Guidelines](./cqrs-guidelines.md) — Command/query patterns
- [Multi-Tenant Design](./multi-tenant-design.md) — Workspace isolation within modules
- [Domain Documentation](../domain/) — Real module examples
- [API Documentation](../api/) — Endpoint organization
