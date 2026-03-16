# Flashcard Feature Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement flashcard UI with three study modes (Practice, Review, Quiz), custom card creation, and progress tracking integrated into the Learning section.

**Architecture:**
- Backend: Add flashcard module with CRUD for custom cards, study session endpoints, and stats endpoints
- Frontend: Add Study Hub page, Study Session page, Create Flashcard page with routes in Learning section
- Reuse existing `/learning/senses` endpoints for card data

**Tech Stack:** NestJS (CQRS, MikroORM), React 19 (TanStack Router, TanStack Query, Radix UI, Tailwind CSS 4)

---

## File Structure

### Server (New Files)
- `server/src/modules/flashcard/` - New flashcard module
  - `domain/` - Entities, repositories, services
  - `application/` - Commands, queries, handlers
  - `infrastructure/` - ORM entities, mappers, repository implementations
  - `dto/` - Request/response DTOs
  - `controllers/` - REST endpoints
  - `flashcard.module.ts` - Module definition

### Client (New/Modified Files)
- `client/src/modules/learning/flashcard/` - New flashcard feature
  - `pages/` - StudyPage, StudySessionPage, CreateFlashcardPage
  - `components/` - Flashcard components
  - `hooks/` - Custom hooks for study logic
  - `services/` - API calls
  - `stores/` - Zustand stores
  - `types/` - TypeScript types
- `client/src/shared/constants/routes.ts` - Add new routes

---

## Chunk 1: Backend - Flashcard Entity & CRUD

### Task 1.1: Create Flashcard ORM Entity

**Files:**
- Create: `server/src/modules/flashcard/infrastructure/persistence/flashcard.orm-entity.ts`
- Test: `server/src/modules/flashcard/__tests__/flashcard.entity.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// server/src/modules/flashcard/__tests__/flashcard.entity.spec.ts
import { FlashcardOrmEntity } from '../infrastructure/persistence/flashcard.orm-entity';

describe('FlashcardOrmEntity', () => {
  it('should create a flashcard entity', () => {
    const flashcard = new FlashcardOrmEntity();
    flashcard.id = 'test-id';
    flashcard.front = 'Hello';
    flashcard.back = 'Xin chào';
    flashcard.userId = 'user-1';
    flashcard.tenantId = 'tenant-1';
    flashcard.source = 'custom';
    flashcard.wordSenseId = null;
    flashcard.hint = null;
    flashcard.notes = null;
    flashcard.createdAt = new Date();
    flashcard.updatedAt = new Date();

    expect(flashcard.front).toBe('Hello');
    expect(flashcard.source).toBe('custom');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npm run test -- --testPathPattern=flashcard.entity`
Expected: FAIL (file not found)

- [ ] **Step 3: Write the ORM entity**

```typescript
// server/src/modules/flashcard/infrastructure/persistence/flashcard.orm-entity.ts
import { Entity, Property, ManyToOne } from '@mikro-orm/core';
import { BaseOrmEntity } from '@shared/infrastructure/base-orm-entity';

@Entity({ tableName: 'flashcards' })
export class FlashcardOrmEntity extends BaseOrmEntity {
  @Property()
  userId!: string;

  @Property()
  tenantId!: string;

  @Property()
  front!: string;

  @Property()
  back!: string;

  @Property({ nullable: true })
  hint?: string;

  @Property({ nullable: true })
  notes?: string;

  @Property({ enum: ['dictionary', 'custom'] })
  source!: 'dictionary' | 'custom';

  @Property({ nullable: true })
  wordSenseId?: string;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && npm run test -- --testPathPattern=flashcard.entity`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/flashcard/ server/src/modules/flashcard/__tests__/
git commit -m "feat(server): add Flashcard ORM entity"
```

---

### Task 1.2: Create Flashcard Repository Interface & Implementation

**Files:**
- Create: `server/src/modules/flashcard/domain/repositories/flashcard.repository.interface.ts`
- Create: `server/src/modules/flashcard/infrastructure/repositories/flashcard.repository.ts`
- Test: `server/src/modules/flashcard/__tests__/flashcard.repository.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// server/src/modules/flashcard/__tests__/flashcard.repository.spec.ts
import { FlashcardRepository } from '../domain/repositories/flashcard.repository.interface';

describe('FlashcardRepository', () => {
  it('should be defined', () => {
    expect(FlashcardRepository).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npm run test -- --testPathPattern=flashcard.repository`
Expected: FAIL (repository not defined)

- [ ] **Step 3: Write repository interface**

```typescript
// server/src/modules/flashcard/domain/repositories/flashcard.repository.interface.ts
import { Repository } from '@core/repository';
import { FlashcardOrmEntity } from '../../infrastructure/persistence/flashcard.orm-entity';

export interface FlashcardRepository extends Repository<FlashcardOrmEntity> {
  findByUserId(userId: string, tenantId: string): Promise<FlashcardOrmEntity[]>;
  findByIdAndUser(id: string, userId: string, tenantId: string): Promise<FlashcardOrmEntity | null>;
}
```

- [ ] **Step 4: Write repository implementation**

```typescript
// server/src/modules/flashcard/infrastructure/repositories/flashcard.repository.ts
import { EntityRepository } from '@mikro-orm/core';
import { FlashcardOrmEntity } from '../persistence/flashcard.orm-entity';
import { FlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';

export class FlashcardRepositoryImpl extends EntityRepository<FlashcardOrmEntity> implements FlashcardRepository {
  async findByUserId(userId: string, tenantId: string): Promise<FlashcardOrmEntity[]> {
    return this.find({ userId, tenantId });
  }

  async findByIdAndUser(id: string, userId: string, tenantId: string): Promise<FlashcardOrmEntity | null> {
    return this.findOne({ id, userId, tenantId });
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd server && npm run test -- --testPathPattern=flashcard.repository`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add Flashcard repository"
```

---

### Task 1.3: Create Flashcard CRUD Commands & Queries

**Files:**
- Create: `server/src/modules/flashcard/application/commands/create-flashcard.command.ts`
- Create: `server/src/modules/flashcard/application/commands/create-flashcard.handler.ts`
- Create: `server/src/modules/flashcard/application/commands/delete-flashcard.command.ts`
- Create: `server/src/modules/flashcard/application/commands/delete-flashcard.handler.ts`
- Create: `server/src/modules/flashcard/application/commands/update-flashcard.command.ts`
- Create: `server/src/modules/flashcard/application/commands/update-flashcard.handler.ts`
- Create: `server/src/modules/flashcard/application/queries/get-flashcards.query.ts`
- Create: `server/src/modules/flashcard/application/queries/get-flashcards.handler.ts`
- Create: `server/src/modules/flashcard/dto/flashcard.dto.ts`
- Test: `server/src/modules/flashcard/__tests__/flashcard.commands.spec.ts`

- [ ] **Step 1: Write DTOs**

```typescript
// server/src/modules/flashcard/dto/flashcard.dto.ts
export class FlashcardDto {
  id!: string;
  userId!: string;
  tenantId!: string;
  front!: string;
  back!: string;
  hint?: string;
  notes?: string;
  source!: 'dictionary' | 'custom';
  wordSenseId?: string;
  createdAt!: string;
  updatedAt!: string;
}

export class CreateFlashcardRequestDto {
  front!: string;
  back!: string;
  hint?: string;
  notes?: string;
  source!: 'dictionary' | 'custom';
  wordSenseId?: string;
}
```

- [ ] **Step 2: Write CreateFlashcard command and handler**

```typescript
// server/src/modules/flashcard/application/commands/create-flashcard.command.ts
export class CreateFlashcardCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly front: string,
    public readonly back: string,
    public readonly hint: string | undefined,
    public readonly notes: string | undefined,
    public readonly source: 'dictionary' | 'custom',
    public readonly wordSenseId: string | undefined,
  ) {}
}
```

```typescript
// server/src/modules/flashcard/application/commands/create-flashcard.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FlashcardOrmEntity } from '../../infrastructure/persistence/flashcard.orm-entity';
import { FlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { CreateFlashcardCommand } from './create-flashcard.command';
import { FlashcardDto } from '../../dto/flashcard.dto';

@CommandHandler(CreateFlashcardCommand)
export class CreateFlashcardHandler implements ICommandHandler<CreateFlashcardCommand> {
  constructor(private readonly flashcardRepo: FlashcardRepository) {}

  async execute(command: CreateFlashcardCommand): Promise<FlashcardDto> {
    const flashcard = new FlashcardOrmEntity();
    flashcard.tenantId = command.tenantId;
    flashcard.userId = command.userId;
    flashcard.front = command.front;
    flashcard.back = command.back;
    flashcard.hint = command.hint;
    flashcard.notes = command.notes;
    flashcard.source = command.source;
    flashcard.wordSenseId = command.wordSenseId;

    await this.flashcardRepo.persist(flashcard);

    return {
      id: flashcard.id,
      userId: flashcard.userId,
      tenantId: flashcard.tenantId,
      front: flashcard.front,
      back: flashcard.back,
      hint: flashcard.hint,
      notes: flashcard.notes,
      source: flashcard.source,
      wordSenseId: flashcard.wordSenseId,
      createdAt: flashcard.createdAt.toISOString(),
      updatedAt: flashcard.updatedAt.toISOString(),
    };
  }
}
```

- [ ] **Step 3: Write GetFlashcards query and handler**

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
import { FlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { GetFlashcardsQuery } from './get-flashcards.query';
import { FlashcardDto } from '../../dto/flashcard.dto';

@QueryHandler(GetFlashcardsQuery)
export class GetFlashcardsHandler implements IQueryHandler<GetFlashcardsQuery> {
  constructor(private readonly flashcardRepo: FlashcardRepository) {}

  async execute(query: GetFlashcardsQuery): Promise<FlashcardDto[]> {
    const flashcards = await this.flashcardRepo.findByUserId(query.userId, query.tenantId);
    return flashcards.map(f => ({
      id: f.id,
      userId: f.userId,
      tenantId: f.tenantId,
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
import { FlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { DeleteFlashcardCommand } from './delete-flashcard.command';

@CommandHandler(DeleteFlashcardCommand)
export class DeleteFlashcardHandler implements ICommandHandler<DeleteFlashcardCommand> {
  constructor(private readonly flashcardRepo: FlashcardRepository) {}

  async execute(command: DeleteFlashcardCommand): Promise<boolean> {
    const flashcard = await this.flashcardRepo.findByIdAndUser(command.id, command.userId, command.tenantId);
    if (!flashcard) return false;
    await this.flashcardRepo.remove(flashcard);
    return true;
  }
}
```

- [ ] **Step 5: Write UpdateFlashcard command and handler**

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
import { FlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { UpdateFlashcardCommand } from './update-flashcard.command';
import { FlashcardDto } from '../../dto/flashcard.dto';

@CommandHandler(UpdateFlashcardCommand)
export class UpdateFlashcardHandler implements ICommandHandler<UpdateFlashcardCommand> {
  constructor(private readonly flashcardRepo: FlashcardRepository) {}

  async execute(command: UpdateFlashcardCommand): Promise<FlashcardDto | null> {
    const flashcard = await this.flashcardRepo.findByIdAndUser(
      command.id, command.userId, command.tenantId,
    );
    if (!flashcard) return null;

    flashcard.front = command.front;
    flashcard.back = command.back;
    flashcard.hint = command.hint;
    flashcard.notes = command.notes;

    await this.flashcardRepo.persist(flashcard);

    return {
      id: flashcard.id,
      userId: flashcard.userId,
      tenantId: flashcard.tenantId,
      front: flashcard.front,
      back: flashcard.back,
      hint: flashcard.hint,
      notes: flashcard.notes,
      source: flashcard.source,
      wordSenseId: flashcard.wordSenseId,
      createdAt: flashcard.createdAt.toISOString(),
      updatedAt: flashcard.updatedAt.toISOString(),
    };
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add flashcard CRUD commands and queries"
```

---

### Task 1.4: Create Flashcard Controller

**Files:**
- Create: `server/src/modules/flashcard/controllers/flashcard.controller.ts`
- Modify: `server/src/modules/flashcard/flashcard.module.ts`

- [ ] **Step 1: Write the controller**

```typescript
// server/src/modules/flashcard/controllers/flashcard.controller.ts
import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ApiResponse as ApiResponseBuilder } from '@core/api';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { CreateFlashcardCommand } from '../application/commands/create-flashcard.command';
import { DeleteFlashcardCommand } from '../application/commands/delete-flashcard.command';
import { GetFlashcardsQuery } from '../application/queries/get-flashcards.query';
import { CreateFlashcardRequestDto, FlashcardDto } from '../dto/flashcard.dto';

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
  @ApiResponse({ status: 200, description: 'Flashcards retrieved' })
  async getFlashcards(@CurrentUser() user: ITokenPayload) {
    const query = new GetFlashcardsQuery(user.userId, user.tenantId);
    const flashcards = await this.queryBus.execute<GetFlashcardsQuery, FlashcardDto[]>(query);
    return ApiResponseBuilder.success(flashcards);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new flashcard' })
  @ApiResponse({ status: 201, description: 'Flashcard created' })
  async createFlashcard(
    @Body() dto: CreateFlashcardRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new CreateFlashcardCommand(
      user.tenantId,
      user.userId,
      dto.front,
      dto.back,
      dto.hint,
      dto.notes,
      dto.source,
      dto.wordSenseId,
    );
    const flashcard = await this.commandBus.execute<CreateFlashcardCommand, FlashcardDto>(command);
    return ApiResponseBuilder.success(flashcard, 201);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a flashcard' })
  @ApiResponse({ status: 200, description: 'Flashcard deleted' })
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

- [ ] **Step 2: Write the module**

```typescript
// server/src/modules/flashcard/flashcard.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FlashcardController } from './controllers/flashcard.controller';
import { FlashcardRepository } from './domain/repositories/flashcard.repository.interface';
import { FlashcardRepositoryImpl } from './infrastructure/repositories/flashcard.repository';

// Commands
import { CreateFlashcardHandler } from './application/commands/create-flashcard.handler';
import { DeleteFlashcardHandler } from './application/commands/delete-flashcard.handler';

// Queries
import { GetFlashcardsHandler } from './application/queries/get-flashcards.handler';

const CommandHandlers = [CreateFlashcardHandler, DeleteFlashcardHandler];
const QueryHandlers = [GetFlashcardsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [FlashcardController],
  providers: [
    { provide: FlashcardRepository, useClass: FlashcardRepositoryImpl },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class FlashcardModule {}
```

- [ ] **Step 3: Modify app.module.ts to include FlashcardModule**

Open `server/src/app.module.ts` and add FlashcardModule to the imports:

```typescript
import { FlashcardModule } from './modules/flashcard/flashcard.module';

@Module({
  imports: [
    // ... existing imports
    FlashcardModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 4: Run tests to verify**

Run: `cd server && npm run test -- --passWithNoTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/flashcard/ server/src/app.module.ts
git commit -m "feat(server): add flashcard controller and module"
```

---

## Chunk 2: Backend - Study Session & Stats

### Task 2.1: Create Study Stats Entity & Endpoints

**Files:**
- Create: `server/src/modules/flashcard/infrastructure/persistence/study-stats.orm-entity.ts`
- Create: `server/src/modules/flashcard/domain/repositories/study-stats.repository.interface.ts`
- Create: `server/src/modules/flashcard/infrastructure/repositories/study-stats.repository.ts`
- Create: `server/src/modules/flashcard/controllers/study-stats.controller.ts`
- Modify: `server/src/modules/flashcard/flashcard.module.ts`

- [ ] **Step 1: Create Study Stats Entity**

```typescript
// server/src/modules/flashcard/infrastructure/persistence/study-stats.orm-entity.ts
import { Entity, Property } from '@mikro-orm/core';
import { BaseOrmEntity } from '@shared/infrastructure/base-orm-entity';

@Entity({ tableName: 'study_stats' })
export class StudyStatsOrmEntity extends BaseOrmEntity {
  @Property()
  userId!: string;

  @Property()
  tenantId!: string;

  @Property({ default: 0 })
  streak!: number;

  @Property({ default: 0 })
  totalCardsReviewed!: number;

  @Property({ default: 0 })
  totalStudyTimeMinutes!: number;

  @Property({ default: 0 })
  masteredCards!: number;

  @Property({ nullable: true })
  lastStudyDate?: Date;
}
```

- [ ] **Step 2: Create repository interface and implementation**

```typescript
// server/src/modules/flashcard/domain/repositories/study-stats.repository.interface.ts
import { Repository } from '@core/repository';
import { StudyStatsOrmEntity } from '../../infrastructure/persistence/study-stats.orm-entity';

export interface StudyStatsRepository extends Repository<StudyStatsOrmEntity> {
  findByUserId(userId: string, tenantId: string): Promise<StudyStatsOrmEntity | null>;
}
```

```typescript
// server/src/modules/flashcard/infrastructure/repositories/study-stats.repository.ts
import { EntityRepository } from '@mikro-orm/core';
import { StudyStatsOrmEntity } from '../persistence/study-stats.orm-entity';
import { StudyStatsRepository } from '../../domain/repositories/study-stats.repository.interface';

export class StudyStatsRepositoryImpl extends EntityRepository<StudyStatsOrmEntity> implements StudyStatsRepository {
  async findByUserId(userId: string, tenantId: string): Promise<StudyStatsOrmEntity | null> {
    return this.findOne({ userId, tenantId });
  }
}
```

- [ ] **Step 3: Create StudyStatsController**

```typescript
// server/src/modules/flashcard/controllers/study-stats.controller.ts
import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ApiResponse as ApiResponseBuilder } from '@core/api';
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { StudyStatsDto } from '../dto/study-stats.dto';

@ApiTags('Study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'study' })
export class StudyStatsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get study statistics' })
  async getStats(@CurrentUser() user: ITokenPayload) {
    // Implementation queries StudyStatsRepository
    const stats = { streak: 0, totalCardsReviewed: 0, totalStudyTimeMinutes: 0, masteredCards: 0 };
    return ApiResponseBuilder.success(stats);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add study stats entity and endpoints"
```

---

### Task 2.2: Create Due Cards Query

**Files:**
- Create: `server/src/modules/flashcard/application/queries/get-due-cards.query.ts`
- Create: `server/src/modules/flashcard/application/queries/get-due-cards.handler.ts`
- Modify: `server/src/modules/flashcard/controllers/study.controller.ts`

- [ ] **Step 1: Create GetDueCards query**

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

- [ ] **Step 2: Create handler that combines learning list + custom flashcards**

```typescript
// server/src/modules/flashcard/application/queries/get-due-cards.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetDueCardsQuery } from './get-due-cards.query';

interface DueCardDto {
  id: string;
  front: string;
  back: string;
  hint?: string;
  source: 'learning-list' | 'custom';
  masteryLevel: number;
  nextReviewAt?: string;
}

@QueryHandler(GetDueCardsQuery)
export class GetDueCardsHandler implements IQueryHandler<GetDueCardsQuery> {
  async execute(query: GetDueCardsQuery): Promise<DueCardDto[]> {
    const limit = query.limit ?? 20;
    const now = new Date().toISOString();

    // In implementation, this would:
    // 1. Query learning list for cards where nextReviewAt <= now (due for review)
    // 2. Query custom flashcards
    // 3. Combine and sort by mastery level
    // 4. Return top N cards

    return []; // Placeholder - implement with actual repository queries
  }
}
```

- [ ] **Step 3: Create Study Controller with review endpoint**

```typescript
// server/src/modules/flashcard/controllers/study.controller.ts
import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ApiResponse as ApiResponseBuilder } from '@core/api';
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { GetDueCardsQuery } from '../application/queries/get-due-cards.query';

@ApiTags('Study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'study' })
export class StudyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @Post('review')
  @ApiOperation({ summary: 'Submit a card review' })
  async submitReview(
    @CurrentUser() user: ITokenPayload,
    @Body() dto: { cardId: string; rating: string },
  ) {
    // Process rating and update mastery/next review date
    return ApiResponseBuilder.success({ success: true });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/modules/flashcard/
git commit -m "feat(server): add due cards query and study controller"
```

---

## Chunk 3: Frontend - API Services & Types

### Task 3.1: Create Flashcard API Service

**Files:**
- Create: `client/src/modules/learning/flashcard/services/flashcard.api.ts`
- Create: `client/src/modules/learning/flashcard/types/flashcard.types.ts`

- [ ] **Step 1: Write types**

```typescript
// client/src/modules/learning/flashcard/types/flashcard.types.ts
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  notes?: string;
  source: 'dictionary' | 'custom';
  wordSenseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyStats {
  streak: number;
  totalCardsReviewed: number;
  totalStudyTimeMinutes: number;
  masteredCards: number;
  lastStudyDate?: string;
}

export type StudyMode = 'practice' | 'review' | 'quiz';

export type StudySource = 'learning-list' | 'topic' | 'custom';
```

- [ ] **Step 2: Write API service**

```typescript
// client/src/modules/learning/flashcard/services/flashcard.api.ts
import { api, apiCall, type ApiSuccessResponse } from '@/core/api';
import type { Flashcard, StudyStats } from '../types/flashcard.types';

export const FlashcardApi = {
  getFlashcards: async () => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<Flashcard[]>>('/flashcards'),
    );
    return result;
  },

  createFlashcard: async (data: {
    front: string;
    back: string;
    hint?: string;
    notes?: string;
    source: 'dictionary' | 'custom';
    wordSenseId?: string;
  }) => {
    const { data: response } = await api.post<
      unknown,
      ApiSuccessResponse<Flashcard>
    >('/flashcards', data);
    return response;
  },

  deleteFlashcard: async (id: string) => {
    const { data } = await api.delete<unknown, ApiSuccessResponse<boolean>>(
      `/flashcards/${id}`,
    );
    return data;
  },

  getDueCards: async (limit = 20) => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<any[]>>('/study/due', {
        params: { $top: limit },
      }),
    );
    return result;
  },

  getStudyStats: async () => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<StudyStats>>('/study/stats'),
    );
    return result;
  },

  submitReview: async (cardId: string, rating: string) => {
    const { data } = await api.post<unknown, ApiSuccessResponse<any>>(
      '/study/review',
      { cardId, rating },
    );
    return data;
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add client/src/modules/learning/flashcard/
git commit -m "feat(client): add flashcard API service and types"
```

---

## Chunk 4: Frontend - Routes & Navigation

### Task 4.1: Add Routes for Flashcard Pages

**Files:**
- Modify: `client/src/shared/constants/routes.ts`
- Modify: `client/src/routes.ts`

- [ ] **Step 1: Add route constants**

```typescript
// client/src/shared/constants/routes.ts
export const APP_ROUTES = {
  // ... existing
  LEARNING: {
    ...existing,
    STUDY: '/learning/study',
    CREATE: '/learning/flashcard/create',
    SESSION: '/learning/flashcard/session',
  },
} as const;
```

- [ ] **Step 2: Add routes to routes.ts**

```typescript
// client/src/routes.ts
route(APP_ROUTES.LEARNING.STUDY, './modules/learning/flashcard/pages/study-page.tsx'),
route(APP_ROUTES.LEARNING.CREATE, './modules/learning/flashcard/pages/create-flashcard-page.tsx'),
route(APP_ROUTES.LEARNING.SESSION, './modules/learning/flashcard/pages/study-session-page.tsx'),
```

- [ ] **Step 3: Commit**

```bash
git add client/src/shared/constants/routes.ts client/src/routes.ts
git commit -m "feat(client): add flashcard routes"
```

---

## Chunk 5: Frontend - Study Hub Page

### Task 5.1: Create Study Hub Page

**Files:**
- Create: `client/src/modules/learning/flashcard/pages/study-page.tsx`
- Create: `client/src/modules/learning/flashcard/components/study-mode-selector.tsx`
- Create: `client/src/modules/learning/flashcard/components/source-selector.tsx`

- [ ] **Step 1: Write StudyHubPage component**

```tsx
// client/src/modules/learning/flashcard/pages/study-page.tsx
import { useNavigate } from '@tanstack/react-router';
import { useStudyStats } from '../hooks/use-study-stats';
import { StudyModeSelector } from '../components/study-mode-selector';
import { SourceSelector } from '../components/source-selector';
import { useState } from 'react';

export function StudyPage() {
  const navigate = useNavigate();
  const { data: stats } = useStudyStats();
  const [mode, setMode] = useState<'practice' | 'review' | 'quiz'>('practice');
  const [source, setSource] = useState<'learning-list' | 'topic'>('learning-list');
  const [cardCount, setCardCount] = useState(20);

  const handleStart = () => {
    navigate({
      to: '/learning/flashcard/session',
      search: { mode, source, cardCount },
    });
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Study</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Streak" value={stats?.streak ?? 0} />
        <StatCard label="Mastered" value={stats?.masteredCards ?? 0} />
        <StatCard label="Reviewed" value={stats?.totalCardsReviewed ?? 0} />
        <StatCard label="Time" value={`${stats?.totalStudyTimeMinutes ?? 0}m`} />
      </div>

      {/* Quick Start */}
      <button onClick={handleStart} className="btn-primary w-full mb-8">
        Quick Start - 20 cards
      </button>

      {/* Mode Selection */}
      <StudyModeSelector value={mode} onChange={setMode} />

      {/* Source Selection */}
      <SourceSelector value={source} onChange={setSource} />

      {/* Card Count */}
      <div className="mt-6">
        <label>Cards: {cardCount}</label>
        <input
          type="range"
          min={10}
          max={50}
          value={cardCount}
          onChange={(e) => setCardCount(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card rounded-lg p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Write useStudyStats hook**

```tsx
// client/src/modules/learning/flashcard/hooks/use-study-stats.ts
import { useQuery } from '@tanstack/react-query';
import { FlashcardApi } from '../services/flashcard.api';

export function useStudyStats() {
  return useQuery({
    queryKey: ['study-stats'],
    queryFn: async () => {
      const result = await FlashcardApi.getStudyStats();
      return result.data;
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/modules/learning/flashcard/
git commit -m "feat(client): add study hub page"
```

---

## Chunk 6: Frontend - Study Session Page

### Task 6.1: Create Study Session Page with Card UI

**Files:**
- Create: `client/src/modules/learning/flashcard/pages/study-session-page.tsx`
- Create: `client/src/modules/learning/flashcard/components/flashcard-display.tsx`
- Create: `client/src/modules/learning/flashcard/components/rating-buttons.tsx`

- [ ] **Step 1: Write FlashcardDisplay component with flip animation**

```tsx
// client/src/modules/learning/flashcard/components/flashcard-display.tsx
import { useState } from 'react';

interface FlashcardDisplayProps {
  front: string;
  back: string;
  hint?: string;
}

export function FlashcardDisplay({ front, back, hint }: FlashcardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-96 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-card rounded-xl p-8 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold mb-4">{front}</div>
          {hint && <div className="text-muted-foreground">Hint: {hint}</div>}
          <div className="text-sm text-muted-foreground mt-4">Click to flip</div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card rounded-xl p-8 flex flex-col items-center justify-center">
          <div className="text-2xl">{back}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write RatingButtons component**

```tsx
// client/src/modules/learning/flashcard/components/rating-buttons.tsx
interface RatingButtonsProps {
  mode: 'practice' | 'review' | 'quiz';
  onRate: (rating: string) => void;
}

export function RatingButtons({ mode, onRate }: RatingButtonsProps) {
  const buttons = {
    practice: [
      { label: "Don't Know", value: 'dont-know', color: 'destructive' },
      { label: 'Know', value: 'know', color: 'primary' },
    ],
    review: [
      { label: 'Again', value: 'again', color: 'destructive' },
      { label: 'Hard', value: 'hard', color: 'secondary' },
      { label: 'Good', value: 'good', color: 'primary' },
      { label: 'Easy', value: 'easy', color: 'success' },
    ],
    quiz: [
      { label: 'Wrong', value: 'wrong', color: 'destructive' },
      { label: 'Correct', value: 'correct', color: 'primary' },
      { label: 'Easy', value: 'easy', color: 'success' },
    ],
  };

  return (
    <div className="flex gap-2 justify-center">
      {buttons[mode].map((btn) => (
        <button
          key={btn.value}
          onClick={() => onRate(btn.value)}
          className={`btn-${btn.color} px-4 py-2 rounded-lg`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write StudySessionPage**

```tsx
// client/src/modules/learning/flashcard/pages/study-session-page.tsx
import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { FlashcardDisplay } from '../components/flashcard-display';
import { RatingButtons } from '../components/rating-buttons';
import { useStudyCards } from '../hooks/use-study-cards';

export function StudySessionPage() {
  const search = useSearch({ from: '/learning/flashcard/session' });
  const navigate = useNavigate();
  const { cards, currentIndex, isFlipped, flip, rate, isComplete } = useStudyCards({
    mode: search.mode,
    source: search.source,
    cardCount: search.cardCount,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        flip();
      }
      // Rating shortcuts: 1-4 based on mode
      if (isFlipped && e.key >= '1' && e.key <= '4') {
        const ratings = mode === 'practice'
          ? ['dont-know', 'know']
          : mode === 'review'
            ? ['again', 'hard', 'good', 'easy']
            : ['wrong', 'correct', 'easy'];
        const rating = ratings[parseInt(e.key) - 1];
        if (rating) rate(rating);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flip, isFlipped, mode, rate]);

  if (isComplete) {
    return <SessionSummaryPage />;
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <button onClick={() => navigate({ to: '/learning/study' })}>Exit</button>
        </div>
        <div className="h-2 bg-muted rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <FlashcardDisplay
        front={currentCard.front}
        back={currentCard.back}
        hint={currentCard.hint}
      />

      {/* Rating */}
      {isFlipped && (
        <div className="mt-8">
          <RatingButtons mode={search.mode} onRate={rate} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write useStudyCards hook**

```tsx
// client/src/modules/learning/flashcard/hooks/use-study-cards.ts
import { useState, useCallback, useEffect } from 'react';
import { FlashcardApi } from '../services/flashcard.api';
import type { Flashcard } from '../types/flashcard.types';

interface UseStudyCardsParams {
  mode: 'practice' | 'review' | 'quiz';
  source: 'learning-list' | 'topic';
  cardCount: number;
}

export function useStudyCards({ mode, source, cardCount }: UseStudyCardsParams) {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cards on mount
  useEffect(() => {
    async function loadCards() {
      try {
        if (source === 'learning-list') {
          const response = await FlashcardApi.getDueCards(cardCount);
          setCards(response.data ?? []);
        } else {
          // TODO: Load from topic - integrate with topic API
          setCards([]);
        }
      } catch (error) {
        console.error('Failed to load cards:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCards();
  }, [mode, source, cardCount]);

  const flip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const rate = useCallback(async (rating: string) => {
    const card = cards[currentIndex];
    if (!card) return;

    await FlashcardApi.submitReview(card.id, rating);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, cards]);

  return { cards, currentIndex, isFlipped, flip, rate, isComplete, isLoading };
}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/modules/learning/flashcard/
git commit -m "feat(client): add study session page with card UI"
```

---

## Chunk 7: Frontend - Create Flashcard Page

### Task 7.1: Create Flashcard Creation Page

**Files:**
- Create: `client/src/modules/learning/flashcard/pages/create-flashcard-page.tsx`
- Create: `client/src/modules/learning/flashcard/components/flashcard-form.tsx`

- [ ] **Step 1: Write FlashcardForm component**

```tsx
// client/src/modules/learning/flashcard/components/flashcard-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const flashcardSchema = z.object({
  front: z.string().min(1, 'Front text is required'),
  back: z.string().min(1, 'Back text is required'),
  hint: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['dictionary', 'custom']),
  wordSenseId: z.string().optional(),
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

interface FlashcardFormProps {
  onSubmit: (data: FlashcardFormData) => Promise<void>;
}

export function FlashcardForm({ onSubmit }: FlashcardFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: { source: 'custom' },
  });

  const source = watch('source');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Source Toggle */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" value="custom" {...register('source')} />
          From Scratch
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="dictionary" {...register('source')} />
          From Dictionary
        </label>
      </div>

      {/* Front */}
      <div>
        <label className="block text-sm font-medium mb-1">Front (Word)</label>
        <input {...register('front')} className="input w-full" />
        {errors.front && <p className="text-destructive text-sm">{errors.front.message}</p>}
      </div>

      {/* Back */}
      <div>
        <label className="block text-sm font-medium mb-1">Back (Definition/Translation)</label>
        <textarea {...register('back')} className="input w-full" rows={3} />
        {errors.back && <p className="text-destructive text-sm">{errors.back.message}</p>}
      </div>

      {/* Hint */}
      <div>
        <label className="block text-sm font-medium mb-1">Hint (Optional)</label>
        <input {...register('hint')} className="input w-full" />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
        <textarea {...register('notes')} className="input w-full" rows={2} />
      </div>

      <button type="submit" className="btn-primary w-full">Create Flashcard</button>
    </form>
  );
}
```

- [ ] **Step 2: Write CreateFlashcardPage**

```tsx
// client/src/modules/learning/flashcard/pages/create-flashcard-page.tsx
import { useNavigate } from '@tanstack/react-router';
import { useCreateFlashcard } from '../hooks/use-create-flashcard';
import { FlashcardForm } from '../components/flashcard-form';
import { toast } from 'sonner';

export function CreateFlashcardPage() {
  const navigate = useNavigate();
  const { mutateAsync: createFlashcard } = useCreateFlashcard();

  const handleSubmit = async (data: any) => {
    await createFlashcard(data);
    toast.success('Flashcard created!');
    navigate({ to: '/learning/study' });
  };

  return (
    <div className="container mx-auto max-w-lg py-8">
      <h1 className="text-2xl font-bold mb-6">Create Flashcard</h1>
      <FlashcardForm onSubmit={handleSubmit} />
    </div>
  );
}
```

- [ ] **Step 3: Write useCreateFlashcard hook**

```tsx
// client/src/modules/learning/flashcard/hooks/use-create-flashcard.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashcardApi } from '../services/flashcard.api';

export function useCreateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FlashcardApi.createFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/modules/learning/flashcard/
git commit -m "feat(client): add create flashcard page"
```

---

## Chunk 8: Session Summary & Polish

### Task 8.1: Create Session Summary Page

**Files:**
- Create: `client/src/modules/learning/flashcard/pages/session-summary-page.tsx`

- [ ] **Step 1: Create session store for passing data between pages**

```typescript
// client/src/modules/learning/flashcard/stores/session-store.ts
import { create } from 'zustand';

interface SessionState {
  cardsReviewed: number;
  correctCount: number;
  startTime: Date | null;
  endTime: Date | null;
  leveledUp: number;
  setSessionData: (data: Partial<SessionState>) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  cardsReviewed: 0,
  correctCount: 0,
  startTime: null,
  endTime: null,
  leveledUp: 0,
  setSessionData: (data) => set((state) => ({ ...state, ...data })),
  reset: () => set({ cardsReviewed: 0, correctCount: 0, startTime: null, endTime: null, leveledUp: 0 }),
}));
```

- [ ] **Step 2: Write summary page using session store**

```tsx
// client/src/modules/learning/flashcard/pages/session-summary-page.tsx
import { useNavigate } from '@tanstack/react-router';
import { useSessionStore } from '../stores/session-store';

export function SessionSummaryPage() {
  const navigate = useNavigate();
  const { cardsReviewed, correctCount, startTime, leveledUp } = useSessionStore();

  const timeSpent = startTime
    ? Math.round((new Date().getTime() - startTime.getTime()) / 60000)
    : 0;
  const accuracy = cardsReviewed > 0 ? Math.round((correctCount / cardsReviewed) * 100) : 0;

  const handleContinue = () => {
    useSessionStore.getState().reset();
    navigate({ to: '/learning/flashcard/session' });
  };

  const handleBack = () => {
    useSessionStore.getState().reset();
    navigate({ to: '/learning/study' });
  };

  return (
    <div className="container mx-auto max-w-lg py-8 text-center">
      <h1 className="text-3xl font-bold mb-8">Session Complete!</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatBox label="Cards Reviewed" value={cardsReviewed.toString()} />
        <StatBox label="Accuracy" value={`${accuracy}%`} />
        <StatBox label="Time Spent" value={`${timeSpent}m`} />
        <StatBox label="Leveled Up" value={leveledUp.toString()} />
      </div>

      <div className="flex gap-4">
        <button onClick={handleBack} className="btn-secondary flex-1">
          Back to Study
        </button>
        <button onClick={handleContinue} className="btn-primary flex-1">
          Continue Studying
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-lg p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/modules/learning/flashcard/
git commit -m "feat(client): add session summary page"
```

---

## Summary

The implementation is broken into 8 chunks:

1. **Backend: Flashcard Entity & CRUD** - ORM entity, repository, commands, queries, controller
2. **Backend: Study Session & Stats** - Stats entity, due cards query, study controller
3. **Frontend: API Services & Types** - Flashcard API, TypeScript types
4. **Frontend: Routes & Navigation** - Add routes to Learning section
5. **Frontend: Study Hub Page** - Entry point with Quick Start, mode/source selection
6. **Frontend: Study Session Page** - Full screen card UI with flip animation, rating buttons
7. **Frontend: Create Flashcard Page** - Form for creating custom flashcards
8. **Session Summary & Polish** - End-of-session summary page

Each chunk is designed to be implemented independently with clear test boundaries.
