import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { FlashcardModule } from '../../flashcard/flashcard.module';
import { ProgressModule } from '../progress/progress.module';
import { TopicModule } from '../topic/topic.module';

import { WordExampleOrmEntity } from '../../dictionary/infrastructure/persistence/word-example.orm-entity';
import { WordSenseOrmEntity } from '../../dictionary/infrastructure/persistence/word-sense.orm-entity';
import { WordOrmEntity } from '../../dictionary/infrastructure/persistence/word.orm-entity';
import { FlashcardOrmEntity } from '../../flashcard/infrastructure/persistence/flashcard.orm-entity';
import { TopicOrmEntity } from '../topic/infrastructure/persistence/topic.orm-entity';
import { CompleteStudySessionHandler } from './application/commands/complete-study-session.handler';
import { StartStudySessionHandler } from './application/commands/start-study-session.handler';
import { StudySessionReviewHandler } from './application/commands/study-session-review.handler';
import { StudyStatsInitializerHandler } from './application/events/study-stats-initializer.handler';
import { UpdateStudyStatsHandler } from './application/events/update-study-stats.handler';
import { GetDueCardsHandler } from './application/queries/get-due-cards.handler';
import { GetQuizCardsHandler } from './application/queries/get-quiz-cards.handler';
import { GetSessionSummaryHandler } from './application/queries/get-session-summary.handler';
import { GetStudyStatsHandler } from './application/queries/get-study-stats.handler';
import { GetTopicCardsHandler } from './application/queries/get-topic-cards.handler';
import { StudySessionController } from './controllers/study-session.controller';
import { StudyController } from './controllers/study.controller';
import {
  provideStudyStatsRepository,
  studyStatsRepositoryToken,
} from './domain/repositories/study-stats.repository.interface';
import { StudyStatsMapper } from './infrastructure/mappers/study-stats.mapper';
import { StudyReviewLogOrmEntity } from './infrastructure/persistence/study-review-log.orm-entity';
import { StudySessionOrmEntity } from './infrastructure/persistence/study-session.orm-entity';
import { StudyStatsOrmEntity } from './infrastructure/persistence/study-stats.orm-entity';
import { StudySessionRepository } from './infrastructure/repositories/study-session.repository';
import { StudyStatsRepository } from './infrastructure/repositories/study-stats.repository';
import { StudySessionReviewLogListener } from './listeners/study-session-review-log.listener';

const queryHandlers = [
  GetDueCardsHandler,
  GetQuizCardsHandler,
  GetTopicCardsHandler,
  GetSessionSummaryHandler,
  GetStudyStatsHandler,
];
const commandHandlers = [
  StartStudySessionHandler,
  StudySessionReviewHandler,
  CompleteStudySessionHandler,
];
const eventHandlers = [UpdateStudyStatsHandler, StudyStatsInitializerHandler];
const listeners = [StudySessionReviewLogListener];
const controllers = [StudyController, StudySessionController];
const mappers = [StudyStatsMapper];
const repositories = [
  StudySessionRepository,
  provideStudyStatsRepository(StudyStatsRepository),
];

@Module({
  imports: [
    CqrsModule,
    TopicModule,
    ProgressModule,
    // FlashcardModule is imported so NestJS can resolve FLASHCARD_REPOSITORY_TOKEN
    // injected in GetDueCardsHandler. FlashcardModule EXPORTS its repository token.
    FlashcardModule,
    MikroOrmModule.forFeature([
      StudySessionOrmEntity,
      StudyReviewLogOrmEntity,
      StudyStatsOrmEntity,
      FlashcardOrmEntity,
      WordSenseOrmEntity,
      WordOrmEntity,
      WordExampleOrmEntity,
      TopicOrmEntity,
    ]),
  ],
  controllers,
  providers: [
    ...queryHandlers,
    ...commandHandlers,
    ...eventHandlers,
    ...listeners,
    ...repositories,
    ...mappers,
  ],
  exports: [StudySessionRepository, studyStatsRepositoryToken],
})
export class StudyModule {}
