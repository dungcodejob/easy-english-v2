import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ProgressModule } from '../learning/progress/progress.module';
import { CreateFlashcardHandler } from './application/commands/create-flashcard/create-flashcard.handler';
import { DeleteFlashcardHandler } from './application/commands/delete-flashcard/delete-flashcard.handler';
import { ReviewCardHandler } from './application/commands/review-card/review-card.handler';
import { UpdateFlashcardHandler } from './application/commands/update-flashcard/update-flashcard.handler';
import { GetFlashcardsHandler } from './application/queries/get-flashcards.handler';
import { FlashcardController } from './controllers/flashcard.controller';
import {
  provideFlashcardRepository,
  flashcardRepositoryToken,
} from './domain/repositories/flashcard.repository.interface';
import {
  provideReviewLogRepository,
  ReviewLogRepositoryToken,
} from './domain/repositories/review-log.repository.interface';
import { FlashcardMapper } from './infrastructure/mappers/flashcard.mapper';
import { ReviewLogMapper } from './infrastructure/mappers/review-log.mapper';
import { FlashcardOrmEntity } from './infrastructure/persistence/flashcard.orm-entity';
import { ReviewLogOrmEntity } from './infrastructure/persistence/review-log.orm-entity';
import { FlashcardRepository } from './infrastructure/repositories/flashcard.repository';
import { ReviewLogRepository } from './infrastructure/repositories/review-log.repository';

const CommandHandlers = [
  CreateFlashcardHandler,
  UpdateFlashcardHandler,
  DeleteFlashcardHandler,
  ReviewCardHandler,
];

const QueryHandlers = [GetFlashcardsHandler];

const Repositories = [
  provideFlashcardRepository(FlashcardRepository),
  provideReviewLogRepository(ReviewLogRepository),
];

const Mappers = [FlashcardMapper, ReviewLogMapper];

@Module({
  imports: [
    CqrsModule,
    ProgressModule,
    MikroOrmModule.forFeature([FlashcardOrmEntity, ReviewLogOrmEntity]),
  ],
  controllers: [FlashcardController],
  providers: [
    ...Repositories,
    ...Mappers,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    FlashcardMapper,
    // Export tokens so other modules can inject these WITHOUT importing FlashcardModule
    flashcardRepositoryToken,
    ReviewLogRepositoryToken,
  ],
})
export class FlashcardModule {}
