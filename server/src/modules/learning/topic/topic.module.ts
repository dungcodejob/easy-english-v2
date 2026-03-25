import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { TopicController } from './controllers/topic.controller';

// Domain repositories (interfaces + DI tokens)
import { provideTopicRepository } from './domain/repositories/topic.repository.interface';

// Infrastructure
import { TopicMapper } from './infrastructure/mappers';
import { TopicWordOrmEntity } from './infrastructure/persistence/topic-word.orm-entity';
import { TopicOrmEntity } from './infrastructure/persistence/topic.orm-entity';
import { TopicRepository } from './infrastructure/repositories/topic.repository';

// Progress module ORM entities (needed for ListTopicWordsHandler progressMap query)
import { UserWordSenseProgressOrmEntity } from '../progress/infrastructure/persistence/user-word-sense-progress.orm-entity';

// Application
import { AddTopicWordHandler } from './application/commands/add-topic-word.handler';
import { CreateTopicHandler } from './application/commands/create-topic.handler';
import { DeleteTopicHandler } from './application/commands/delete-topic.handler';
import { RemoveTopicWordHandler } from './application/commands/remove-topic-word.handler';
import { UpdateTopicHandler } from './application/commands/update-topic.handler';
import { GetTopicDetailHandler } from './application/queries/get-topic-detail.handler';
import { GetTopicsHandler } from './application/queries/get-topics.handler';
import { ListTopicWordsHandler } from './application/queries/list-topic-words.handler';

const CommandHandlers = [
  CreateTopicHandler,
  UpdateTopicHandler,
  DeleteTopicHandler,
  AddTopicWordHandler,
  RemoveTopicWordHandler,
];

const QueryHandlers = [
  GetTopicsHandler,
  GetTopicDetailHandler,
  ListTopicWordsHandler,
];

const Repositories = [provideTopicRepository(TopicRepository)];

const Mappers = [TopicMapper];

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([TopicOrmEntity, TopicWordOrmEntity, UserWordSenseProgressOrmEntity]),
  ],
  controllers: [TopicController],
  providers: [
    ...Repositories,
    ...Mappers,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [...Repositories],
})
export class TopicModule {}
