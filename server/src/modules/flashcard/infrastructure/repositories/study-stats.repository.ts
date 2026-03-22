import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { StudyStatsOrmEntity } from '../persistence/study-stats.orm-entity';
import { IStudyStatsRepository } from '../../domain/repositories/study-stats.repository.interface';

@Injectable()
export class StudyStatsRepository implements IStudyStatsRepository {
  constructor(private readonly em: EntityManager) {}

  async findByUserId(userId: string, tenantId: string): Promise<StudyStatsOrmEntity | null> {
    return this.em.findOne(StudyStatsOrmEntity, { userId, tenantId });
  }

  async create(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity> {
    this.em.persist(stats);
    return stats;
  }

  async update(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity> {
    this.em.persist(stats);
    return stats;
  }
}
