import { createInjection } from '@shared/utils';
import { StudyStats } from '../entities/study-stats.aggregate';

export interface IStudyStatsRepository {
  findByUserId(userId: string, tenantId: string): Promise<StudyStats | null>;
  findOrCreate(userId: string, tenantId: string): Promise<StudyStats>;
  persist(stats: StudyStats): Promise<void>;
  delete(id: string): Promise<boolean>;
}

const { inject, provider, token } = createInjection<IStudyStatsRepository>(
  'IStudyStatsRepository',
);

export const InjectStudyStatsRepository = inject;
export const provideStudyStatsRepository = provider;
export const StudyStatsRepositoryToken = token;
