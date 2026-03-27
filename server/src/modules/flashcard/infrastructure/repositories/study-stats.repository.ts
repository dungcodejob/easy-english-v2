import { Injectable } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';

import { StudyStats } from '../../domain/entities/study-stats.aggregate';
import { StudyStatsMapper } from '../mappers/study-stats.mapper';
import { StudyStatsOrmEntity } from '../persistence/study-stats.orm-entity';

import type { IStudyStatsRepository } from '../../domain/repositories/study-stats.repository.interface';

/**
 * StudyStats Repository - Infrastructure Layer
 *
 * Responsibility: ONLY persistence operations
 */
@Injectable()
export class StudyStatsRepository implements IStudyStatsRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: StudyStatsMapper,
  ) {}

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

  async persist(stats: StudyStats): Promise<void> {
    const orm = this.mapper.toPersistence(stats);

    this.em.persist(orm);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.em.nativeDelete(StudyStatsOrmEntity, { id });

    return deleted > 0;
  }
}
