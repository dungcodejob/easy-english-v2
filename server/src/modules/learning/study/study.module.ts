import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TopicModule } from '../topic/topic.module';
import { ProgressModule } from '../progress/progress.module';
import { GetDueCardsHandler } from './application/queries/get-due-cards.handler';
import { GetTopicCardsHandler } from './application/queries/get-topic-cards.handler';
import { GetSessionSummaryHandler } from './application/queries/get-session-summary.handler';
import { StudyController } from './controllers/study.controller';
import { StudySessionController } from './controllers/study-session.controller';
import { StudySessionRepository } from './infrastructure/repositories/study-session.repository';
import { StudySessionOrmEntity } from './infrastructure/persistence/study-session.orm-entity';
import { StudyReviewLogOrmEntity } from './infrastructure/persistence/study-review-log.orm-entity';
import { UserWordSenseProgressOrmEntity } from '../progress/infrastructure/persistence/user-word-sense-progress.orm-entity';
import { WordSenseOrmEntity } from '../../dictionary/infrastructure/persistence/word-sense.orm-entity';
import { WordOrmEntity } from '../../dictionary/infrastructure/persistence/word.orm-entity';
import { WordExampleOrmEntity } from '../../dictionary/infrastructure/persistence/word-example.orm-entity';
import { TopicOrmEntity } from '../topic/infrastructure/persistence/topic.orm-entity';
import { StartStudySessionHandler } from './application/commands/start-study-session.handler';
import { StudySessionReviewHandler } from './application/commands/study-session-review.handler';
import { CompleteStudySessionHandler } from './application/commands/complete-study-session.handler';
import { StudySessionReviewLogListener } from './listeners/study-session-review-log.listener';

const queryHandlers = [
  GetDueCardsHandler,
  GetTopicCardsHandler,
  GetSessionSummaryHandler,
];
const commandHandlers = [
  StartStudySessionHandler,
  StudySessionReviewHandler,
  CompleteStudySessionHandler,
];
const listeners = [StudySessionReviewLogListener];
const controllers = [StudyController, StudySessionController];

@Module({
  imports: [
    CqrsModule,
    TopicModule,
    ProgressModule,
    MikroOrmModule.forFeature([
      StudySessionOrmEntity,
      StudyReviewLogOrmEntity,
      UserWordSenseProgressOrmEntity,
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
    ...listeners,
    StudySessionRepository,
  ],
  exports: [StudySessionRepository],
})
export class StudyModule {}
