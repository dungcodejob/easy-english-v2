import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { StudyStats } from '../../domain/entities/study-stats.aggregate';
import { IStudyStatsRepository } from '../../domain/repositories/study-stats.repository.interface';
import { StudyStatsMapper } from '../mappers/study-stats.mapper';
import { StudyStatsOrmEntity } from '../persistence/study-stats.orm-entity';

@Injectable()
export class StudyStatsRepository implements IStudyStatsRepository {
  private readonly mapper = new StudyStatsMapper();

  constructor(private readonly em: EntityManager) {}

  async findByUserId(
    userId: string,
    tenantId: string,
  ): Promise<StudyStats | null> {
    const orm = await this.em.findOne(StudyStatsOrmEntity, {
      userId,
      tenantId,
    });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findOrCreate(userId: string, tenantId: string): Promise<StudyStats> {
    const existing = await this.findByUserId(userId, tenantId);
    if (existing) return existing;
    return StudyStats.create(tenantId, userId);
  }

  async persist(stats: StudyStats): Promise<void> {
    const orm = this.mapper.toPersistence(stats);
    this.em.persist(orm);
  }

  async delete(id: string): Promise<boolean> {
    const orm = await this.em.findOne(StudyStatsOrmEntity, { id });
    if (!orm) return false;
    await this.em.remove(orm);
    return true;
  }
}
