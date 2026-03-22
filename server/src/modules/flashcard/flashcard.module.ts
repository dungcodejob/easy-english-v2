import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FlashcardController } from './controllers/flashcard.controller';
import { StudyController } from './controllers/study.controller';

import { provideFlashcardRepository } from './domain/repositories/flashcard.repository.interface';
import { provideStudyStatsRepository } from './domain/repositories/study-stats.repository.interface';
import { FlashcardOrmEntity } from './infrastructure/persistence/flashcard.orm-entity';
import { StudyStatsOrmEntity } from './infrastructure/persistence/study-stats.orm-entity';
import { FlashcardRepository } from './infrastructure/repositories/flashcard.repository';
import { StudyStatsRepository } from './infrastructure/repositories/study-stats.repository';

import { CreateFlashcardHandler } from './application/commands/create-flashcard.handler';
import { DeleteFlashcardHandler } from './application/commands/delete-flashcard.handler';
import { UpdateFlashcardHandler } from './application/commands/update-flashcard.handler';

import { GetDueCardsHandler } from './application/queries/get-due-cards.handler';
import { GetFlashcardsHandler } from './application/queries/get-flashcards.handler';
import { GetStudyStatsHandler } from './application/queries/get-study-stats.handler';

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

const Repositories = [
  provideFlashcardRepository(FlashcardRepository),
  provideStudyStatsRepository(StudyStatsRepository),
];

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([FlashcardOrmEntity, StudyStatsOrmEntity]),
  ],
  controllers: [FlashcardController, StudyController],
  providers: [...Repositories, ...CommandHandlers, ...QueryHandlers],
  exports: [],
})
export class FlashcardModule {}
