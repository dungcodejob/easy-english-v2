import type { FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CardState } from '../../../../learning/progress/domain/value-objects/card-state.vo';
import { FsrsParameters } from '../../../../learning/progress/domain/value-objects/fsrs-parameters.vo';
import { UserWordSenseProgressOrmEntity } from '../../../../learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity';
import { TopicWordDto } from '../../dto/responses/topic.dto';
import { TopicMapper } from '../../infrastructure/mappers/topic.mapper';
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
 * Read layer — handles listing words in a topic with pagination.
 * Status is derived at read time from UserWordSenseProgress.fsrsParams via progressMap.
 */
@QueryHandler(ListTopicWordsQuery)
export class ListTopicWordsHandler implements IQueryHandler<
  ListTopicWordsQuery,
  PaginatedTopicWordsResponse
> {
  constructor(
    private readonly em: EntityManager,
    private readonly topicMapper: TopicMapper,
  ) {}

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

    // Paginate topic words
    const [words, count] = await this.em.findAndCount(
      TopicWordOrmEntity,
      { topic: { id: topicId } },
      {
        limit: top,
        offset: skip,
        orderBy: { addedAt: 'DESC' },
      },
    );

    if (words.length === 0) {
      return { data: [], count };
    }

    // Build progressMap: wordSenseId → FsrsParameters
    const wordSenseIds = words.map((w) => w.wordSenseId);
    const filterUserId: string = userId;
    const progressRecords = await this.em.find(
      UserWordSenseProgressOrmEntity,
      {
        wordSense: { $in: wordSenseIds },
        userId: filterUserId,
        archivedAt: null,
      } as FilterQuery<UserWordSenseProgressOrmEntity>,
      { populate: ['wordSense'] },
    );

    const progressMap = new Map<string, FsrsParameters>(
      (progressRecords as UserWordSenseProgressOrmEntity[]).map((r) => [
        r.wordSense.id,
        new FsrsParameters({
          stability: r.stability,
          difficulty: r.difficulty,
          lapses: r.lapses,
          reps: r.reps,
          state: CardState.from(r.state),
          dueDate: r.dueDate,
          lastReviewDate: r.lastReviewDate,
        }),
      ]),
    );

    // Map words directly with derived status (no need to rehydrate full Topic)
    const data: TopicWordDto[] = words.map((w) => {
      const params = progressMap.get(w.wordSenseId);
      let status: 'NEW' | 'LEARNING' | 'MASTERED' = 'NEW';
      if (params) {
        if (
          params.state.value === 'relearning' ||
          params.state.value === 'learning'
        ) {
          status = 'LEARNING';
        } else if (params.isMastered) {
          status = 'MASTERED';
        }
      }
      return {
        id: w.id,
        topicId,
        wordSenseId: w.wordSenseId,
        status,
        addedAt: w.addedAt,
      } as TopicWordDto;
    });

    return { data, count };
  }
}
