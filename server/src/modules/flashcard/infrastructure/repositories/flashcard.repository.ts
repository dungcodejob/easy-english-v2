import { Injectable } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';

import { Flashcard } from '../../domain/entities/flashcard.aggregate';
import { IFlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { FlashcardMapper } from '../mappers/flashcard.mapper';
import { FlashcardOrmEntity } from '../persistence/flashcard.orm-entity';

/**
 * Flashcard Repository - Infrastructure Layer
 *
 * Responsibility: ONLY persistence operations
 * - Find flashcard entities by various criteria
 * - Persist flashcard aggregates
 * - Remove flashcard entities by ID
 *
 * Rules:
 * - MUST NOT contain business logic
 * - MUST NOT call flush() - transaction handled at handler layer
 * - MUST NOT create domain objects (use factories in domain layer)
 * - Mapper is injected via constructor for testability
 */
@Injectable()
export class FlashcardRepository implements IFlashcardRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: FlashcardMapper,
  ) {}

  /**
   * Find a flashcard by its unique identifier.
   * Returns null if not found.
   */
  async findById(id: string): Promise<Flashcard | null> {
    const orm = await this.em.findOne(FlashcardOrmEntity, { id });

    return orm ? this.mapper.toDomain(orm) : null;
  }

  /**
   * Find all flashcards belonging to a specific user within a tenant.
   * Multi-tenant safe: requires both userId AND tenantId.
   */
  async findByUserId(userId: string, tenantId: string): Promise<Flashcard[]> {
    const orms = await this.em.find(FlashcardOrmEntity, { userId, tenantId });

    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  /**
   * Find all flashcards for a user (no longer filters by due date — that logic
   * now lives in GetDueCardsHandler using UserWordSenseProgress).
   * Multi-tenant safe: requires both userId AND tenantId.
   */
  async findDueCards(
    userId: string,
    tenantId: string,
    _now: Date,
    limit = 20,
  ): Promise<Flashcard[]> {
    const orms = await this.em.find(
      FlashcardOrmEntity,
      { userId, tenantId },
      { limit },
    );

    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  /**
   * Persist a flashcard aggregate.
   * Changes are staged but NOT flushed - caller handles transaction.
   * This allows batching multiple operations in a single transaction.
   */

  async persist(flashcard: Flashcard): Promise<void> {
    const orm = this.mapper.toPersistence(flashcard);

    this.em.persist(orm);
  }

  /**
   * Delete a flashcard by ID within a tenant scope.
   * Multi-tenant safe: validates tenantId to prevent cross-tenant deletion.
   * Uses nativeDelete for efficiency (single query instead of find + remove).
   * Returns true if entity was deleted, false if not found.
   */
  async delete(id: string, userId: string, tenantId: string): Promise<boolean> {
    const deleted = await this.em.nativeDelete(FlashcardOrmEntity, {
      id,
      userId,
      tenantId,
    });

    return deleted > 0;
  }
}
