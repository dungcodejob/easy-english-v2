# Flashcard Feature Implementation Plan (DDD)

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement flashcard UI with three study modes (Practice, Review, Quiz), custom card creation, and progress tracking integrated into the Learning section using Domain-Driven Design.

**Architecture:**
- Follow existing DDD pattern from `learning/topic` module
- Backend: Flashcard module with domain entities, repository interfaces, CQRS commands/queries
- Frontend: React with TanStack Router, TanStack Query, Zustand
- Reuse existing `/learning/senses` endpoints

**Tech Stack:** NestJS (CQRS, MikroORM, DDD), React 19 (TanStack Router, TanStack Query)

---

## File Structure (DDD Pattern)

```
server/src/modules/flashcard/
├── domain/
│   ├── entities/
│   │   └── flashcard.entity.ts          # Domain entity
│   ├── repositories/
│   │   ├── flashcard.repository.interface.ts
│   │   └── study-stats.repository.interface.ts
│   └── value-objects/
│       └── rating.value-object.ts       # Rating enum/VO
├── application/
│   ├── commands/
│   │   ├── create-flashcard.command.ts
│   │   ├── create-flashcard.handler.ts
│   │   ├── update-flashcard.command.ts
│   │   ├── update-flashcard.handler.ts
│   │   ├── delete-flashcard.command.ts
│   │   └── delete-flashcard.handler.ts
│   └── queries/
│       ├── get-flashcards.query.ts
│       ├── get-flashcards.handler.ts
│       ├── get-due-cards.query.ts
│       ├── get-due-cards.handler.ts
│       ├── get-study-stats.query.ts
│       └── get-study-stats.handler.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── flashcard.orm-entity.ts     # ORM entity
│   │   └── study-stats.orm-entity.ts   # ORM entity
│   ├── repositories/
│   │   ├── flashcard.repository.ts      # Repository implementation
│   │   └── study-stats.repository.ts    # Repository implementation
│   └── mappers/
│       └── flashcard.mapper.ts
├── dto/
│   ├── requests/
│   │   ├── create-flashcard.request.dto.ts
│   │   └── update-flashcard.request.dto.ts
│   └── responses/
│       ├── flashcard.response.dto.ts
│       └── study-stats.response.dto.ts
├── controllers/
│   ├── flashcard.controller.ts         # CRUD endpoints
│   └── study.controller.ts             # Study session endpoints
└── flashcard.module.ts                 # Module registration
```

---

## Chunk 1: Backend - Domain & Infrastructure

### Task 1.1: Create Flashcard ORM Entity (Infrastructure)

**Files:**
- Create: `server/src/modules/flashcard/infrastructure/persistence/flashcard.orm-entity.ts`
- Test: `server/src/modules/flashcard/__tests__/flashcard.orm-entity.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// server/src/modules/flashcard/__tests__/flashcard.orm-entity.spec.ts
import { FlashcardOrmEntity } from '../../infrastructure/persistence/flashcard.orm-entity';

describe('FlashcardOrmEntity', () => {
  it('should create a flashcard entity', () => {
    const flashcard = new FlashcardOrmEntity(
      'tenant-1',
      'user-1',
      'Hello',
      'Xin chào',
      'custom',
    );

    expect(flashcard.front).toBe('Hello');
    expect(flashcard.back).toBe('Xin chào');
    expect(flashcard.source).toBe('custom');
    expect(flashcard.id).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npm run test -- --testPathPattern=flashcard.orm-entity`
Expected: FAIL (file not found)

- [ ] **Step 3: Write the ORM entity following TopicEntity pattern**

```typescript
// server/src/modules/flashcard/infrastructure/persistence/flashcard.orm-entity.ts
import {
  Entity,
  Index,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'flashcards' })
export class FlashcardOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  @Property({ type: 'uuid' })
  @Index()
  userId!: string;

  @Property({ length: 500 })
  front!: string;

  @Property({ length: 1000 })
  back!: string;

  @Property({ length: 255, nullable: true })
  hint?: string;

  @Property({ length: 1000, nullable: true })
  notes?: string;

  @Property({ enum: ['dictionary', 'custom'] })
  source!: 'dictionary' | 'custom';

  @Property({ type: 'uuid', nullable: true })
  wordSenseId?: string;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    tenantId: string,
    userId: string,
    front: string,
    back: string,
    source: 'dictionary' | 'custom',
    hint?: string,
    notes?: string,
    wordSenseId?: string,
  ) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.front = front;
    this.back = back;
    this.source = source;
    this.hint = hint;
    this.notes = notes;
    this.wordSenseId = wordSenseId;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && npm run test -- --testPathPattern=flashcard.orm-entity`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add Flashcard ORM entity"
```

---

### Task 1.2: Create StudyStats ORM Entity

**Files:**
- Create: `server/src/modules/flashcard/infrastructure/persistence/study-stats.orm-entity.ts`

- [ ] **Step 1: Write the ORM entity**

```typescript
// server/src/modules/flashcard/infrastructure/persistence/study-stats.orm-entity.ts
import {
  Entity,
  Index,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'study_stats' })
export class StudyStatsOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  @Property({ type: 'uuid' })
  @Index()
  userId!: string;

  @Property({ default: 0 })
  streak!: number;

  @Property({ default: 0 })
  totalCardsReviewed!: number;

  @Property({ default: 0 })
  totalStudyTimeMinutes!: number;

  @Property({ default: 0 })
  masteredCards!: number;

  @Property({ type: 'datetime', nullable: true })
  lastStudyDate?: Date;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, userId: string) {
    this.tenantId = tenantId;
    this.userId = userId;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add StudyStats ORM entity"
```

---

### Task 1.3: Create Repository Interfaces (Domain Layer)

**Files:**
- Create: `server/src/modules/flashcard/domain/repositories/flashcard.repository.interface.ts`
- Create: `server/src/modules/flashcard/domain/repositories/study-stats.repository.interface.ts`

- [ ] **Step 1: Write repository interfaces**

```typescript
// server/src/modules/flashcard/domain/repositories/flashcard.repository.interface.ts
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { FlashcardOrmEntity } from '../../infrastructure/persistence/flashcard.orm-entity';

export interface IFlashcardRepository {
  findById(id: string): Promise<FlashcardOrmEntity | null>;
  findByUserId(userId: string, tenantId: string): Promise<FlashcardOrmEntity[]>;
  create(flashcard: FlashcardOrmEntity): Promise<FlashcardOrmEntity>;
  update(flashcard: FlashcardOrmEntity): Promise<FlashcardOrmEntity>;
  delete(id: string): Promise<boolean>;
}

export const IFlashcardRepository = Symbol('IFlashcardRepository');
```

```typescript
// server/src/modules/flashcard/domain/repositories/study-stats.repository.interface.ts
import { StudyStatsOrmEntity } from '../../infrastructure/persistence/study-stats.orm-entity';

export interface IStudyStatsRepository {
  findByUserId(userId: string, tenantId: string): Promise<StudyStatsOrmEntity | null>;
  create(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity>;
  update(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity>;
}

export const IStudyStatsRepository = Symbol('IStudyStatsRepository');
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add flashcard repository interfaces"
```

---

### Task 1.4: Create Repository Implementations (Infrastructure Layer)

**Files:**
- Create: `server/src/modules/flashcard/infrastructure/repositories/flashcard.repository.ts`
- Create: `server/src/modules/flashcard/infrastructure/repositories/study-stats.repository.ts`

- [ ] **Step 1: Write repository implementations**

```typescript
// server/src/modules/flashcard/infrastructure/repositories/flashcard.repository.ts
import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { FlashcardOrmEntity } from '../persistence/flashcard.orm-entity';
import { IFlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';

@Injectable()
export class FlashcardRepository implements IFlashcardRepository {
  constructor(private readonly em: EntityManager) {}

  private get repo(): EntityRepository<FlashcardOrmEntity> {
    return this.em.getRepository(FlashcardOrmEntity);
  }

  async findById(id: string): Promise<FlashcardOrmEntity | null> {
    return this.repo.findOne({ id });
  }

  async findByUserId(userId: string, tenantId: string): Promise<FlashcardOrmEntity[]> {
    return this.repo.find({ userId, tenantId });
  }

  async create(flashcard: FlashcardOrmEntity): Promise<FlashcardOrmEntity> {
    await this.repo.persist(flashcard);
    return flashcard;
  }

  async update(flashcard: FlashcardOrmEntity): Promise<FlashcardOrmEntity> {
    await this.repo.persist(flashcard);
    return flashcard;
  }

  async delete(id: string): Promise<boolean> {
    const flashcard = await this.findById(id);
    if (!flashcard) return false;
    await this.repo.remove(flashcard);
    return true;
  }
}
```

```typescript
// server/src/modules/flashcard/infrastructure/repositories/study-stats.repository.ts
import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { StudyStatsOrmEntity } from '../persistence/study-stats.orm-entity';
import { IStudyStatsRepository } from '../../domain/repositories/study-stats.repository.interface';

@Injectable()
export class StudyStatsRepository implements IStudyStatsRepository {
  constructor(private readonly em: EntityManager) {}

  private get repo(): EntityRepository<StudyStatsOrmEntity> {
    return this.em.getRepository(StudyStatsOrmEntity);
  }

  async findByUserId(userId: string, tenantId: string): Promise<StudyStatsOrmEntity | null> {
    return this.repo.findOne({ userId, tenantId });
  }

  async create(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity> {
    await this.repo.persist(stats);
    return stats;
  }

  async update(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity> {
    await this.repo.persist(stats);
    return stats;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add flashcard repository implementations"
```

---

## Chunk 2: Backend - Application Layer (CQRS)

### Task 2.1: Create DTOs

**Files:**
- Create: `server/src/modules/flashcard/dto/requests/create-flashcard.request.dto.ts`
- Create: `server/src/modules/flashcard/dto/requests/update-flashcard.request.dto.ts`
- Create: `server/src/modules/flashcard/dto/responses/flashcard.response.dto.ts`
- Create: `server/src/modules/flashcard/dto/responses/study-stats.response.dto.ts`

- [ ] **Step 1: Write request DTOs**

```typescript
// server/src/modules/flashcard/dto/requests/create-flashcard.request.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlashcardRequestDto {
  @ApiProperty({ example: 'Hello' })
  @IsString()
  @MaxLength(500)
  front!: string;

  @ApiProperty({ example: 'Xin chào' })
  @IsString()
  @MaxLength(1000)
  back!: string;

  @ApiPropertyOptional({ example: 'Greeting' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  hint?: string;

  @ApiPropertyOptional({ example: 'Common greeting' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ enum: ['dictionary', 'custom'] })
  @IsEnum(['dictionary', 'custom'])
  source!: 'dictionary' | 'custom';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wordSenseId?: string;
}
```

```typescript
// server/src/modules/flashcard/dto/requests/update-flashcard.request.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFlashcardRequestDto {
  @ApiPropertyOptional({ example: 'Hello' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  front?: string;

  @ApiPropertyOptional({ example: 'Xin chào' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  back?: string;

  @ApiPropertyOptional({ example: 'Greeting' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  hint?: string;

  @ApiPropertyOptional({ example: 'Common greeting' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
```

- [ ] **Step 2: Write response DTOs**

```typescript
// server/src/modules/flashcard/dto/responses/flashcard.response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class FlashcardResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  front!: string;

  @ApiProperty()
  back!: string;

  @ApiPropertyOptional()
  hint?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ enum: ['dictionary', 'custom'] })
  source!: 'dictionary' | 'custom';

  @ApiPropertyOptional()
  wordSenseId?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
```

```typescript
// server/src/modules/flashcard/dto/responses/study-stats.response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class StudyStatsResponseDto {
  @ApiProperty()
  streak!: number;

  @ApiProperty()
  totalCardsReviewed!: number;

  @ApiProperty()
  totalStudyTimeMinutes!: number;

  @ApiProperty()
  masteredCards!: number;

  @ApiPropertyOptional()
  lastStudyDate?: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add flashcard DTOs"
```

---

### Task 2.2: Create Commands and Handlers

**Files:**
- Create: `server/src/modules/flashcard/application/commands/create-flashcard.command.ts`
- Create: `server/src/modules/flashcard/application/commands/create-flashcard.handler.ts`
- Create: `server/src/modules/flashcard/application/commands/update-flashcard.command.ts`
- Create: `server/src/modules/flashcard/application/commands/update-flashcard.handler.ts`
- Create: `server/src/modules/flashcard/application/commands/delete-flashcard.command.ts`
- Create: `server/src/modules/flashcard/application/commands/delete-flashcard.handler.ts`

- [ ] **Step 1: Write CreateFlashcard command**

```typescript
// server/src/modules/flashcard/application/commands/create-flashcard.command.ts
export class CreateFlashcardCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly front: string,
    public readonly back: string,
    public readonly source: 'dictionary' | 'custom',
    public readonly hint?: string,
    public readonly notes?: string,
    public readonly wordSenseId?: string,
  ) {}
}
```

- [ ] **Step 2: Write CreateFlashcardHandler**

```typescript
// server/src/modules/flashcard/application/commands/create-flashcard.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FlashcardOrmEntity } from '../../../infrastructure/persistence/flashcard.orm-entity';
import { IFlashcardRepository } from '../../../domain/repositories/flashcard.repository.interface';
import { CreateFlashcardCommand } from './create-flashcard.command';
import { FlashcardResponseDto } from '../../../dto/responses/flashcard.response.dto';

@CommandHandler(CreateFlashcardCommand)
export class CreateFlashcardHandler implements ICommandHandler<CreateFlashcardCommand> {
  constructor(private readonly flashcardRepo: IFlashcardRepository) {}

  async execute(command: CreateFlashcardCommand): Promise<FlashcardResponseDto> {
    const flashcard = new FlashcardOrmEntity(
      command.tenantId,
      command.userId,
      command.front,
      command.back,
      command.source,
      command.hint,
      command.notes,
      command.wordSenseId,
    );

    const created = await this.flashcardRepo.create(flashcard);

    return {
      id: created.id,
      front: created.front,
      back: created.back,
      hint: created.hint,
      notes: created.notes,
      source: created.source,
      wordSenseId: created.wordSenseId,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }
}
```

- [ ] **Step 3: Write UpdateFlashcard command and handler**

```typescript
// server/src/modules/flashcard/application/commands/update-flashcard.command.ts
export class UpdateFlashcardCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly front: string,
    public readonly back: string,
    public readonly hint?: string,
    public readonly notes?: string,
  ) {}
}
```

```typescript
// server/src/modules/flashcard/application/commands/update-flashcard.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IFlashcardRepository } from '../../../domain/repositories/flashcard.repository.interface';
import { UpdateFlashcardCommand } from './update-flashcard.command';
import { FlashcardResponseDto } from '../../../dto/responses/flashcard.response.dto';

@CommandHandler(UpdateFlashcardCommand)
export class UpdateFlashcardHandler implements ICommandHandler<UpdateFlashcardCommand> {
  constructor(private readonly flashcardRepo: IFlashcardRepository) {}

  async execute(command: UpdateFlashcardCommand): Promise<FlashcardResponseDto | null> {
    const flashcard = await this.flashcardRepo.findById(command.id);
    if (!flashcard || flashcard.userId !== command.userId) {
      return null;
    }

    flashcard.front = command.front;
    flashcard.back = command.back;
    flashcard.hint = command.hint;
    flashcard.notes = command.notes;

    const updated = await this.flashcardRepo.update(flashcard);

    return {
      id: updated.id,
      front: updated.front,
      back: updated.back,
      hint: updated.hint,
      notes: updated.notes,
      source: updated.source,
      wordSenseId: updated.wordSenseId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
```

- [ ] **Step 4: Write DeleteFlashcard command and handler**

```typescript
// server/src/modules/flashcard/application/commands/delete-flashcard.command.ts
export class DeleteFlashcardCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
```

```typescript
// server/src/modules/flashcard/application/commands/delete-flashcard.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IFlashcardRepository } from '../../../domain/repositories/flashcard.repository.interface';
import { DeleteFlashcardCommand } from './delete-flashcard.command';

@CommandHandler(DeleteFlashcardCommand)
export class DeleteFlashcardHandler implements ICommandHandler<DeleteFlashcardCommand> {
  constructor(private readonly flashcardRepo: IFlashcardRepository) {}

  async execute(command: DeleteFlashcardCommand): Promise<boolean> {
    const flashcard = await this.flashcardRepo.findById(command.id);
    if (!flashcard || flashcard.userId !== command.userId) {
      return false;
    }
    return this.flashcardRepo.delete(command.id);
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add flashcard command handlers"
```

---

### Task 2.3: Create Queries and Handlers

**Files:**
- Create: `server/src/modules/flashcard/application/queries/get-flashcards.query.ts`
- Create: `server/src/modules/flashcard/application/queries/get-flashcards.handler.ts`
- Create: `server/src/modules/flashcard/application/queries/get-due-cards.query.ts`
- Create: `server/src/modules/flashcard/application/queries/get-due-cards.handler.ts`
- Create: `server/src/modules/flashcard/application/queries/get-study-stats.query.ts`
- Create: `server/src/modules/flashcard/application/queries/get-study-stats.handler.ts`

- [ ] **Step 1: Write GetFlashcards query and handler**

```typescript
// server/src/modules/flashcard/application/queries/get-flashcards.query.ts
export class GetFlashcardsQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
```

```typescript
// server/src/modules/flashcard/application/queries/get-flashcards.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IFlashcardRepository } from '../../../domain/repositories/flashcard.repository.interface';
import { GetFlashcardsQuery } from './get-flashcards.query';
import { FlashcardResponseDto } from '../../../dto/responses/flashcard.response.dto';

@QueryHandler(GetFlashcardsQuery)
export class GetFlashcardsHandler implements IQueryHandler<GetFlashcardsQuery> {
  constructor(private readonly flashcardRepo: IFlashcardRepository) {}

  async execute(query: GetFlashcardsQuery): Promise<FlashcardResponseDto[]> {
    const flashcards = await this.flashcardRepo.findByUserId(query.userId, query.tenantId);

    return flashcards.map((f) => ({
      id: f.id,
      front: f.front,
      back: f.back,
      hint: f.hint,
      notes: f.notes,
      source: f.source,
      wordSenseId: f.wordSenseId,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    }));
  }
}
```

- [ ] **Step 2: Write GetStudyStats query and handler**

```typescript
// server/src/modules/flashcard/application/queries/get-study-stats.query.ts
export class GetStudyStatsQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
```

```typescript
// server/src/modules/flashcard/application/queries/get-study-stats.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IStudyStatsRepository } from '../../../domain/repositories/study-stats.repository.interface';
import { GetStudyStatsQuery } from './get-study-stats.query';
import { StudyStatsResponseDto } from '../../../dto/responses/study-stats.response.dto';

@QueryHandler(GetStudyStatsQuery)
export class GetStudyStatsHandler implements IQueryHandler<GetStudyStatsQuery> {
  constructor(private readonly statsRepo: IStudyStatsRepository) {}

  async execute(query: GetStudyStatsQuery): Promise<StudyStatsResponseDto> {
    let stats = await this.statsRepo.findByUserId(query.userId, query.tenantId);

    if (!stats) {
      stats = await this.statsRepo.create(
        new (await import('../../../infrastructure/persistence/study-stats.orm-entity')).StudyStatsOrmEntity(
          query.tenantId,
          query.userId,
        ),
      );
    }

    return {
      streak: stats.streak,
      totalCardsReviewed: stats.totalCardsReviewed,
      totalStudyTimeMinutes: stats.totalStudyTimeMinutes,
      masteredCards: stats.masteredCards,
      lastStudyDate: stats.lastStudyDate?.toISOString(),
    };
  }
}
```

- [ ] **Step 3: Write GetDueCards query and handler**

```typescript
// server/src/modules/flashcard/application/queries/get-due-cards.query.ts
export class GetDueCardsQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly limit?: number,
  ) {}
}
```

```typescript
// server/src/modules/flashcard/application/queries/get-due-cards.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { GetDueCardsQuery } from './get-due-cards.query';
import { FlashcardResponseDto } from '../../../dto/responses/flashcard.response.dto';

interface DueCard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  source: 'learning-list' | 'custom';
  masteryLevel: number;
}

@QueryHandler(GetDueCardsQuery)
export class GetDueCardsHandler implements IQueryHandler<GetDueCardsQuery> {
  constructor(private readonly em: EntityManager) {}

  async execute(query: GetDueCardsQuery): Promise<DueCard[]> {
    const limit = query.limit ?? 20;
    const now = new Date();

    // Get custom flashcards
    const customCards = await this.em.find(
      await import('../../infrastructure/persistence/flashcard.orm-entity').then((m) => m.FlashcardOrmEntity),
      { userId: query.userId, tenantId: query.tenantId },
      { limit },
    );

    // Get learning list items due for review
    const learningRepo = this.em.getRepository(
      await import('../../../learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity').then(
        (m) => m.UserWordSenseProgressOrmEntity,
      ),
    );

    const dueItems = await learningRepo.find({
      userId: query.userId,
      tenantId: query.tenantId,
      $or: [{ nextReviewAt: { $lte: now } }, { nextReviewAt: null }],
    });

    // Combine and map to response format
    const customDue: DueCard[] = customCards.map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      hint: c.hint,
      source: 'custom' as const,
      masteryLevel: 0,
    }));

    const learningDue: DueCard[] = dueItems.slice(0, limit - customDue.length).map((item) => ({
      id: `learning-${item.wordSenseId}`,
      front: '', // Would need to join with word table
      back: '',
      source: 'learning-list' as const,
      masteryLevel: item.masteryLevel,
    }));

    return [...customDue, ...learningDue].slice(0, limit);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add flashcard query handlers"
```

---

### Task 2.4: Create Controllers

**Files:**
- Create: `server/src/modules/flashcard/controllers/flashcard.controller.ts`
- Create: `server/src/modules/flashcard/controllers/study.controller.ts`

- [ ] **Step 1: Write FlashcardController**

```typescript
// server/src/modules/flashcard/controllers/flashcard.controller.ts
import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ApiResponse as ApiResponseBuilder } from '@core/api';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { CreateFlashcardCommand } from '../application/commands/create-flashcard.command';
import { UpdateFlashcardCommand } from '../application/commands/update-flashcard.command';
import { DeleteFlashcardCommand } from '../application/commands/delete-flashcard.command';
import { GetFlashcardsQuery } from '../application/queries/get-flashcards.query';
import { CreateFlashcardRequestDto } from '../dto/requests/create-flashcard.request.dto';
import { UpdateFlashcardRequestDto } from '../dto/requests/update-flashcard.request.dto';
import { FlashcardResponseDto } from '../dto/responses/flashcard.response.dto';

@ApiTags('Flashcards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'flashcards' })
export class FlashcardController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all flashcards for user' })
  async getFlashcards(@CurrentUser() user: ITokenPayload) {
    const query = new GetFlashcardsQuery(user.userId, user.tenantId);
    const flashcards = await this.queryBus.execute<GetFlashcardsQuery, FlashcardResponseDto[]>(query);
    return ApiResponseBuilder.success(flashcards);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new flashcard' })
  @ApiResponse({ status: 201, type: FlashcardResponseDto })
  async createFlashcard(
    @Body() dto: CreateFlashcardRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new CreateFlashcardCommand(
      user.tenantId,
      user.userId,
      dto.front,
      dto.back,
      dto.source,
      dto.hint,
      dto.notes,
      dto.wordSenseId,
    );
    const flashcard = await this.commandBus.execute<CreateFlashcardCommand, FlashcardResponseDto>(command);
    return ApiResponseBuilder.success(flashcard, 201);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a flashcard' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, type: FlashcardResponseDto })
  async updateFlashcard(
    @Param('id') id: string,
    @Body() dto: UpdateFlashcardRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new UpdateFlashcardCommand(
      id,
      user.userId,
      user.tenantId,
      dto.front ?? '',
      dto.back ?? '',
      dto.hint,
      dto.notes,
    );
    const flashcard = await this.commandBus.execute<UpdateFlashcardCommand, FlashcardResponseDto | null>(command);
    return ApiResponseBuilder.success(flashcard);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a flashcard' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200 })
  async deleteFlashcard(
    @Param('id') id: string,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new DeleteFlashcardCommand(id, user.userId, user.tenantId);
    const result = await this.commandBus.execute<DeleteFlashcardCommand, boolean>(command);
    return ApiResponseBuilder.success(result);
  }
}
```

- [ ] **Step 2: Write StudyController**

```typescript
// server/src/modules/flashcard/controllers/study.controller.ts
import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ApiResponse as ApiResponseBuilder } from '@core/api';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { GetDueCardsQuery } from '../application/queries/get-due-cards.query';
import { GetStudyStatsQuery } from '../application/queries/get-study-stats.query';
import { StudyStatsResponseDto } from '../dto/responses/study-stats.response.dto';

@ApiTags('Study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'study' })
export class StudyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get study statistics' })
  @ApiResponse({ type: StudyStatsResponseDto })
  async getStats(@CurrentUser() user: ITokenPayload) {
    const query = new GetStudyStatsQuery(user.userId, user.tenantId);
    const stats = await this.queryBus.execute<GetStudyStatsQuery, StudyStatsResponseDto>(query);
    return ApiResponseBuilder.success(stats);
  }

  @Get('due')
  @ApiOperation({ summary: 'Get cards due for review' })
  async getDueCards(
    @CurrentUser() user: ITokenPayload,
    @Query('limit') limit?: number,
  ) {
    const query = new GetDueCardsQuery(user.userId, user.tenantId, limit);
    const cards = await this.queryBus.execute<GetDueCardsQuery, any[]>(query);
    return ApiResponseBuilder.success(cards);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add flashcard controllers"
```

---

### Task 2.5: Create Flashcard Module

**Files:**
- Create: `server/src/modules/flashcard/flashcard.module.ts`
- Modify: `server/src/app.module.ts`

- [ ] **Step 1: Write the module**

```typescript
// server/src/modules/flashcard/flashcard.module.ts
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FlashcardController } from './controllers/flashcard.controller';
import { StudyController } from './controllers/study.controller';

import { FlashcardOrmEntity } from './infrastructure/persistence/flashcard.orm-entity';
import { StudyStatsOrmEntity } from './infrastructure/persistence/study-stats.orm-entity';
import { FlashcardRepository } from './infrastructure/repositories/flashcard.repository';
import { StudyStatsRepository } from './infrastructure/repositories/study-stats.repository';
import { IFlashcardRepository } from './domain/repositories/flashcard.repository.interface';
import { IStudyStatsRepository } from './domain/repositories/study-stats.repository.interface';

import { CreateFlashcardHandler } from './application/commands/create-flashcard.handler';
import { UpdateFlashcardHandler } from './application/commands/update-flashcard.handler';
import { DeleteFlashcardHandler } from './application/commands/delete-flashcard.handler';

import { GetFlashcardsHandler } from './application/queries/get-flashcards.handler';
import { GetStudyStatsHandler } from './application/queries/get-study-stats.handler';
import { GetDueCardsHandler } from './application/queries/get-due-cards.handler';

const CommandHandlers = [
  CreateFlashcardHandler,
  UpdateFlashcardHandler,
  DeleteFlashcardHandler,
];

const QueryHandlers = [
  GetFlashcardsHandler,
  GetStudyStatsHandler,
  GetDueCardsHandler,
];

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([FlashcardOrmEntity, StudyStatsOrmEntity]),
  ],
  controllers: [FlashcardController, StudyController],
  providers: [
    FlashcardRepository,
    StudyStatsRepository,
    { provide: IFlashcardRepository, useExisting: FlashcardRepository },
    { provide: IStudyStatsRepository, useExisting: StudyStatsRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [IFlashcardRepository, IStudyStatsRepository],
})
export class FlashcardModule {}
```

- [ ] **Step 2: Modify app.module.ts to include FlashcardModule**

```typescript
// server/src/app.module.ts
import { FlashcardModule } from './modules/flashcard/flashcard.module';

@Module({
  imports: [
    // ... existing imports
    FlashcardModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 3: Run tests to verify**

Run: `cd server && npm run test -- --passWithNoTests`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add server/src/modules/flashcard/ server/src/app.module.ts
git commit -m "feat(server): add flashcard module with DDD structure"
```

---

## Chunk 3-8: Frontend (unchanged from previous plan)

The frontend implementation follows the same structure as the previous plan, with pages, components, hooks, and API services.

---

## Summary

The implementation follows DDD with:
- **Domain Layer**: Repository interfaces
- **Application Layer**: CQRS commands and queries with handlers
- **Infrastructure Layer**: ORM entities and repository implementations
- **DTO Layer**: Request/Response DTOs with validation
- **Controller Layer**: REST endpoints

This matches the existing `learning/topic` module pattern.
