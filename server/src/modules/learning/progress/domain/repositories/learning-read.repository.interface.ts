import { createInjection } from '@shared/utils';

export interface LearningListItemReadModel {
  id: string;
  senseId: string;
  wordText: string;
  definition: string;
  shortDefinition: string | null;
  partOfSpeech: string;
  definitionVi: string | null;
  pronunciations: { ipa: string; audioUrl: string | null; region: string }[];
  isLearning: boolean;
  masteryLevel: number;
  reviewCount: number;
  nextReviewAt: Date | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
}

export interface ILearningReadRepository {
  /**
   * Finds learning list for a user with pagination.
   */
  findLearningList(
    userId: string,
    top: number,
    skip: number,
  ): Promise<{ data: LearningListItemReadModel[]; count: number }>;
}

const { inject, provider, token } = createInjection<ILearningReadRepository>(
  'ILearningReadRepository',
);

export const InjectLearningReadRepository = inject;
export const provideLearningReadRepository = provider;
export const learningReadRepositoryToken = token;
