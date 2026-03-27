import { createInjection } from '@shared/utils';

import { type UserWordSenseProgress } from '../entities/user-word-sense-progress.entity';

export interface ILearningWriteRepository {
  /**
   * Finds a UserWordSenseProgress by user and word sense ID.
   */
  findOneByUserAndSense(
    userId: string,
    wordSenseId: string,
  ): Promise<UserWordSenseProgress | null>;

  /**
   * Saves a UserWordSenseProgress entity.
   */
  save(progress: UserWordSenseProgress): Promise<void>;
}

const { inject, provider, token } = createInjection<ILearningWriteRepository>(
  'ILearningWriteRepository',
);

export const InjectLearningWriteRepository = inject;
export const provideLearningWriteRepository = provider;
export const learningWriteRepositoryToken = token;
