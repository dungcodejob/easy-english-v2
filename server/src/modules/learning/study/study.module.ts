import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TopicModule } from '../topic/topic.module';
import { GetDueCardsHandler } from './application/queries/get-due-cards.handler';
import { GetTopicCardsHandler } from './application/queries/get-topic-cards.handler';
import { StudyController } from './controllers/study.controller';
import { UserWordSenseProgressOrmEntity } from '../progress/infrastructure/persistence/user-word-sense-progress.orm-entity';
import { WordSenseOrmEntity } from '../../dictionary/infrastructure/persistence/word-sense.orm-entity';
import { WordOrmEntity } from '../../dictionary/infrastructure/persistence/word.orm-entity';
import { WordExampleOrmEntity } from '../../dictionary/infrastructure/persistence/word-example.orm-entity';
import { TopicOrmEntity } from '../topic/infrastructure/persistence/topic.orm-entity';

const queryHandlers = [GetDueCardsHandler, GetTopicCardsHandler];

@Module({
  imports: [
    CqrsModule,
    TopicModule,
    MikroOrmModule.forFeature([
      UserWordSenseProgressOrmEntity,
      WordSenseOrmEntity,
      WordOrmEntity,
      WordExampleOrmEntity,
      TopicOrmEntity,
    ]),
  ],
  controllers: [StudyController],
  providers: [...queryHandlers],
})
export class StudyModule {}
