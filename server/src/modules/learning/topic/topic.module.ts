import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AddTopicWordHandler } from './application/commands/add-topic-word.handler';
import { CreateTopicHandler } from './application/commands/create-topic.handler';
import { RemoveTopicWordHandler } from './application/commands/remove-topic-word.handler';
import { GetTopicDetailHandler } from './application/queries/get-topic-detail.handler';
import { GetTopicsHandler } from './application/queries/get-topics.handler';
import { ListTopicWordsHandler } from './application/queries/list-topic-words.handler';
import { TopicController } from './controllers/topic.controller';
import { TopicWordEntity } from './infrastructure/persistence/topic-word.orm-entity';
import { TopicEntity } from './infrastructure/persistence/topic.orm-entity';

const queryHandlers = [
  GetTopicsHandler,
  GetTopicDetailHandler,
  ListTopicWordsHandler,
];

const commandHandlers = [
  CreateTopicHandler,
  AddTopicWordHandler,
  RemoveTopicWordHandler,
];

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([TopicEntity, TopicWordEntity]),
  ],
  controllers: [TopicController],
  providers: [...queryHandlers, ...commandHandlers],
  exports: [MikroOrmModule],
})
export class TopicModule {}
