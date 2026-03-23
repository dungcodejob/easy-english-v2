import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TopicWordDto } from '../../dto/responses/topic.dto';
import { TopicWordOrmEntity } from '../../infrastructure/persistence/topic-word.orm-entity';
import { TopicOrmEntity } from '../../infrastructure/persistence/topic.orm-entity';
import { ListTopicWordsQuery } from './list-topic-words.query';

export interface PaginatedTopicWordsResponse {
  data: TopicWordDto[];
  count: number;
}

/**
 * List Topic Words Query Handler
 *
 * Read layer - handles listing words in a topic with pagination.
 * Uses EntityManager directly since this is a pure read projection with no domain logic.
 */
@QueryHandler(ListTopicWordsQuery)
export class ListTopicWordsHandler implements IQueryHandler<
  ListTopicWordsQuery,
  PaginatedTopicWordsResponse
> {
  constructor(private readonly em: EntityManager) {}

  async execute(
    query: ListTopicWordsQuery,
  ): Promise<PaginatedTopicWordsResponse> {
    const { tenantId, userId, topicId, top, skip } = query;

    // Verify topic ownership before exposing its words
    const topic = await this.em.findOne(TopicOrmEntity, {
      id: topicId,
      tenantId,
      userId,
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const [words, count] = await this.em.findAndCount(
      TopicWordOrmEntity,
      { topic: { id: topicId } },
      {
        limit: top,
        offset: skip,
        orderBy: { addedAt: 'DESC' },
      },
    );

    return {
      data: words.map((w) => ({
        id: w.id,
        topicId: topicId,
        wordSenseId: w.wordSenseId,
        status: w.status,
        addedAt: w.addedAt,
      })),
      count,
    };
  }
}
