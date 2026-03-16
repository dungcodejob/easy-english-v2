import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { FlashcardOrmEntity } from '../persistence/flashcard.orm-entity';
import { IFlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';

@Injectable()
export class FlashcardRepository implements IFlashcardRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<FlashcardOrmEntity | null> {
    return this.em.findOne(FlashcardOrmEntity, { id });
  }

  async findByUserId(userId: string, tenantId: string): Promise<FlashcardOrmEntity[]> {
    return this.em.find(FlashcardOrmEntity, { userId, tenantId });
  }

  async create(flashcard: FlashcardOrmEntity): Promise<FlashcardOrmEntity> {
    this.em.persist(flashcard);
    return flashcard;
  }

  async update(flashcard: FlashcardOrmEntity): Promise<FlashcardOrmEntity> {
    this.em.persist(flashcard);
    return flashcard;
  }

  async delete(id: string): Promise<boolean> {
    const flashcard = await this.findById(id);
    if (!flashcard) return false;
    await this.em.remove(flashcard);
    return true;
  }
}
