import { Injectable } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';

import { Topic } from '../../domain/entities/topic.aggregate';
import {
  ITopicRepository,
  TopicWordRef,
} from '../../domain/repositories/topic.repository.interface';
import { TopicMapper } from '../mappers/topic.mapper';
import { TopicWordOrmEntity } from '../persistence/topic-word.orm-entity';
import { TopicOrmEntity } from '../persistence/topic.orm-entity';

/**
 * Topic Repository - Infrastructure Layer
 *
 * Responsibility: ONLY persistence operations
 * - Find topic aggregates by various criteria
 * - Persist topic aggregates
 * - Remove topic entities by ID
 *
 * Rules:
 * - MUST NOT contain business logic
 * - MUST NOT call flush() - transaction handled at handler layer
 * - MUST NOT create domain objects (use factories in domain layer)
 * - Mapper is injected via constructor for testability
 */
@Injectable()
export class TopicRepository implements ITopicRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: TopicMapper,
  ) {}

  /**
   * Find a topic by its unique identifier within a tenant and user scope.
   * Returns null if not found.
   */
  async findById(
    id: string,
    tenantId: string,
    userId: string,
  ): Promise<Topic | null> {
    const orm = await this.em.findOne(TopicOrmEntity, { id, tenantId, userId });

    return orm ? this.mapper.toDomain(orm) : null;
  }

  /**
   * Find all topics belonging to a specific user within a tenant with pagination.
   * Multi-tenant safe: requires both userId AND tenantId.
   */
  async findByUser(
    tenantId: string,
    userId: string,
    top: number,
    skip: number,
  ): Promise<{ data: Topic[]; count: number }> {
    const [orms, count] = await this.em.findAndCount(
      TopicOrmEntity,
      { tenantId, userId },
      { limit: top, offset: skip, orderBy: { createdAt: 'DESC' } },
    );

    return {
      data: orms.map((orm) => this.mapper.toDomain(orm)),
      count,
    };
  }

  /**
   * Find words for a specific topic scoped by tenant and user ownership.
   * Returns lightweight word references in deterministic addedAt order.
   */
  async findWordsByTopic(
    topicId: string,
    tenantId: string,
    userId: string,
  ): Promise<TopicWordRef[]> {
    const words = await this.em.find(
      TopicWordOrmEntity,
      {
        topic: {
          id: topicId,
          tenantId,
          userId,
        },
      },
      {
        orderBy: { addedAt: 'ASC' },
      },
    );

    return words.map((word) => ({
      topicWordId: word.id,
      wordSenseId: word.wordSenseId,
      addedAt: word.addedAt,
    }));
  }

  /**
   * Persist a topic aggregate.
   * Changes are staged but NOT flushed - caller handles transaction.
   * This allows batching multiple operations in a single transaction.
   */
  persist(topic: Topic): void {
    const orm = this.mapper.toPersistence(topic);

    this.em.persist(orm);
  }

  /**
   * Delete a topic by ID within a tenant and user scope.
   * Multi-tenant safe: validates tenantId and userId to prevent cross-tenant deletion.
   * Uses nativeDelete for efficiency (single query instead of find + remove).
   * Returns true if entity was deleted, false if not found.
   */
  async delete(id: string, tenantId: string, userId: string): Promise<boolean> {
    const deleted = await this.em.nativeDelete(TopicOrmEntity, {
      id,
      tenantId,
      userId,
    });

    return deleted > 0;
  }
}
