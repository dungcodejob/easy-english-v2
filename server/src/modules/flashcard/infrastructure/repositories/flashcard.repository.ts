import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Flashcard } from '../../domain/entities/flashcard.aggregate';
import { IFlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { FlashcardMapper } from '../mappers/flashcard.mapper';
import { FlashcardOrmEntity } from '../persistence/flashcard.orm-entity';

@Injectable()
export class FlashcardRepository implements IFlashcardRepository {
  private readonly mapper = new FlashcardMapper();

  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<Flashcard | null> {
    const orm = await this.em.findOne(
      FlashcardOrmEntity,
      { id },
      { populate: ['schedulingState'] },
    );
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string, tenantId: string): Promise<Flashcard[]> {
    const orms = await this.em.find(
      FlashcardOrmEntity,
      { userId, tenantId },
      { populate: ['schedulingState'] },
    );
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async findDueCards(
    userId: string,
    tenantId: string,
    now: Date,
    limit = 20,
  ): Promise<Flashcard[]> {
    const orms = await this.em.find(
      FlashcardOrmEntity,
      { userId, tenantId },
      { populate: ['schedulingState'], limit },
    );
    // Filter due cards in memory
    return orms
      .filter(
        (orm) =>
          orm.schedulingState?.dueDate && orm.schedulingState.dueDate <= now,
      )
      .slice(0, limit)
      .map((orm) => this.mapper.toDomain(orm));
  }

  async persist(flashcard: Flashcard): Promise<void> {
    const orm = this.mapper.toPersistence(flashcard);
    this.em.persist(orm);
  }

  async delete(id: string, userId: string, tenantId: string): Promise<boolean> {
    const orm = await this.em.findOne(FlashcardOrmEntity, {
      id,
      userId,
      tenantId,
    });
    if (!orm) return false;
    this.em.remove(orm);
    return true;
  }
}
