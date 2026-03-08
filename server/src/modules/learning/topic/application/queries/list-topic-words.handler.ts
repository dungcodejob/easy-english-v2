import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TopicWordDto } from '../../dto/responses/topic.dto';
import { TopicWordEntity } from '../../infrastructure/persistence/topic-word.orm-entity';
import { TopicEntity } from '../../infrastructure/persistence/topic.orm-entity';
import { ListTopicWordsQuery } from './list-topic-words.query';

export interface PaginatedTopicWordsResponse {
  data: TopicWordDto[];
  count: number;
}

@QueryHandler(ListTopicWordsQuery)
export class ListTopicWordsHandler implements IQueryHandler<ListTopicWordsQuery> {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async execute(
    query: ListTopicWordsQuery,
  ): Promise<PaginatedTopicWordsResponse> {
    const em = this.orm.em;
    const { tenantId, userId, topicId, top, skip } = query;

    // Verify topic exists and belongs to user
    const topic = await em.findOne(TopicEntity, {
      id: topicId,
      tenantId,
      userId,
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const [words, total] = await em.findAndCount(
      TopicWordEntity,
      { topic: topicId },
      {
        limit: top,
        offset: skip,
        orderBy: { addedAt: 'DESC' },
      },
    );

    return {
      data: words.map((word) => ({
        id: word.id,
        topicId: word.topic.id,
        wordSenseId: word.wordSenseId,
        status: word.status,
        addedAt: word.addedAt,
      })),
      count: total,
    };
  }
}
