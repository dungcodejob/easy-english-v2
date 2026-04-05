import { createInjection } from '@shared/utils';

import type { StudyStats } from '../entities/study-stats.aggregate';

/**
 * StudyStats Repository Interface - Domain Layer
 *
 * Only persistence operations. No business logic.
 * Creation is handled by event listener (StudyStatsInitializerHandler).
 */
export interface IStudyStatsRepository {
  findByUserId(userId: string, tenantId: string): Promise<StudyStats | null>;
  persist(stats: StudyStats): Promise<void>;
  delete(id: string): Promise<boolean>;
}

const { inject, provider } = createInjection<IStudyStatsRepository>(
  'IStudyStatsRepository',
);

export const InjectStudyStatsRepository = inject;
export const provideStudyStatsRepository = provider;
