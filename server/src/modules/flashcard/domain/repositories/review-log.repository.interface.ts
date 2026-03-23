import { createInjection } from '@shared/utils';
import { ReviewLog } from '../entities/review-log.entity';

export interface IReviewLogRepository {
  create(log: ReviewLog): Promise<ReviewLog>;
  findByCardId(cardId: string): Promise<ReviewLog[]>;
  findByUserId(userId: string, tenantId: string): Promise<ReviewLog[]>;
}

const { inject, provider, token } = createInjection<IReviewLogRepository>(
  'IReviewLogRepository',
);

export const InjectReviewLogRepository = inject;
export const provideReviewLogRepository = provider;
export const ReviewLogRepositoryToken = token;
