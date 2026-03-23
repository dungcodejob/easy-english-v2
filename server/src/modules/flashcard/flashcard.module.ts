import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FlashcardController } from './controllers/flashcard.controller';
import { StudyController } from './controllers/study.controller';

import { provideFlashcardRepository } from './domain/repositories/flashcard.repository.interface';
import { provideReviewLogRepository } from './domain/repositories/review-log.repository.interface';
import { provideStudyStatsRepository } from './domain/repositories/study-stats.repository.interface';
import { FsrsSchedulerService } from './domain/services/fsrs-scheduler.service';
import { FlashcardMapper } from './infrastructure/mappers/flashcard.mapper';
import { ReviewLogMapper } from './infrastructure/mappers/review-log.mapper';
import { StudyStatsMapper } from './infrastructure/mappers/study-stats.mapper';
import { FlashcardSchedulingStateOrmEntity } from './infrastructure/persistence/flashcard-scheduling-state.orm-entity';
import { FlashcardOrmEntity } from './infrastructure/persistence/flashcard.orm-entity';
import { ReviewLogOrmEntity } from './infrastructure/persistence/review-log.orm-entity';
import { StudyStatsOrmEntity } from './infrastructure/persistence/study-stats.orm-entity';
import { FlashcardRepository } from './infrastructure/repositories/flashcard.repository';
import { ReviewLogRepository } from './infrastructure/repositories/review-log.repository';
import { StudyStatsRepository } from './infrastructure/repositories/study-stats.repository';

import { CreateFlashcardHandler } from './application/commands/create-flashcard/create-flashcard.handler';
import { DeleteFlashcardHandler } from './application/commands/delete-flashcard/delete-flashcard.handler';
import { ReviewCardHandler } from './application/commands/review-card/review-card.handler';
import { UpdateFlashcardHandler } from './application/commands/update-flashcard/update-flashcard.handler';

import { GetDueCardsHandler } from './application/queries/get-due-cards.handler';
import { GetFlashcardsHandler } from './application/queries/get-flashcards.handler';
import { GetStudyStatsHandler } from './application/queries/get-study-stats.handler';

import { StudyStatsInitializerHandler } from './application/events/study-stats-initializer.handler';
import { UpdateStudyStatsHandler } from './application/events/update-study-stats.handler';

const CommandHandlers = [
  CreateFlashcardHandler,
  UpdateFlashcardHandler,
  DeleteFlashcardHandler,
  ReviewCardHandler,
  UpdateStudyStatsHandler,
  StudyStatsInitializerHandler,
];

const QueryHandlers = [
  GetFlashcardsHandler,
  GetStudyStatsHandler,
  GetDueCardsHandler,
];

const Repositories = [
  provideFlashcardRepository(FlashcardRepository),
  provideStudyStatsRepository(StudyStatsRepository),
  provideReviewLogRepository(ReviewLogRepository),
];

const Mappers = [FlashcardMapper, StudyStatsMapper, ReviewLogMapper];

const Services = [FsrsSchedulerService];

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([
      FlashcardOrmEntity,
      FlashcardSchedulingStateOrmEntity,
      StudyStatsOrmEntity,
      ReviewLogOrmEntity,
    ]),
  ],
  controllers: [FlashcardController, StudyController],
  providers: [
    ...Repositories,
    ...Mappers,
    ...Services,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [],
})
export class FlashcardModule {}
