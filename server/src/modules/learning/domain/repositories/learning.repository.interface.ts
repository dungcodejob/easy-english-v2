import { createInjection } from '@shared/utils';
import { UserWordSenseProgress } from '../entities/user-word-sense-progress.entity';

export interface ILearningRepository {
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

const { inject, provider, token } = createInjection<ILearningRepository>(
  'ILearningRepository',
);

export const InjectLearningRepository = inject;
export const provideLearningRepository = provider;
export const learningRepositoryToken = token;
