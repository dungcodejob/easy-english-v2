import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ReviewLogOrmEntity } from '../persistence/review-log.orm-entity';
import { ReviewLog } from '../../domain/entities/review-log.entity';
import { IReviewLogRepository } from '../../domain/repositories/review-log.repository.interface';
import { ReviewLogMapper } from '../mappers/review-log.mapper';

@Injectable()
export class ReviewLogRepository implements IReviewLogRepository {
  private readonly mapper = new ReviewLogMapper();

  constructor(private readonly em: EntityManager) {}

  async create(log: ReviewLog): Promise<ReviewLog> {
    const orm = this.mapper.toPersistence(log);
    this.em.persist(orm);
    return log;
  }

  async findByCardId(cardId: string): Promise<ReviewLog[]> {
    const orms = await this.em.find(ReviewLogOrmEntity, { cardId });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async findByUserId(userId: string, tenantId: string): Promise<ReviewLog[]> {
    const orms = await this.em.find(ReviewLogOrmEntity, { userId, tenantId });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }
}
