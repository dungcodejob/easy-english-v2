import { createInjection } from '@shared/utils';
import { StudyStatsOrmEntity } from '../../infrastructure/persistence/study-stats.orm-entity';

export interface IStudyStatsRepository {
  findByUserId(
    userId: string,
    tenantId: string,
  ): Promise<StudyStatsOrmEntity | null>;
  create(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity>;
  update(stats: StudyStatsOrmEntity): Promise<StudyStatsOrmEntity>;
}

const { inject, provider, token } = createInjection<IStudyStatsRepository>(
  'IStudyStatsRepository',
);

export const InjectStudyStatsRepository = inject;
export const provideStudyStatsRepository = provider;
export const StudyStatsRepositoryToken = token;
