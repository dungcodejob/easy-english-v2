import { StudyStatsOrmEntity } from '../../infrastructure/persistence/study-stats.orm-entity';

export interface IStudyStatsRepository {
  findByUserId(userId: string, tenantId: string): Promise<StudyStatsOrmEntity | null>;
  create(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity>;
  update(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity>;
}

export const IStudyStatsRepository = Symbol('IStudyStatsRepository');
