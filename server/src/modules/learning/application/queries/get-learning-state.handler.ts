import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { ILearningRepository } from '../../domain/repositories/learning.repository.interface';
import { InjectLearningRepository } from '../../domain/repositories/learning.repository.interface';
import { GetLearningStateQuery } from './get-learning-state.query';

@QueryHandler(GetLearningStateQuery)
export class GetLearningStateHandler implements IQueryHandler<GetLearningStateQuery> {
  constructor(
    @InjectLearningRepository()
    private readonly learningRepo: ILearningRepository,
  ) {}

  async execute(query: GetLearningStateQuery) {
    const progress = await this.learningRepo.findOneByUserAndSense(
      query.userId,
      query.wordSenseId,
    );

    if (!progress) {
      return {
        isLearning: false,
        masteryLevel: 0,
        reviewCount: 0,
        nextReviewAt: new Date().toISOString(),
      };
    }

    return {
      isLearning: true, // If it exists, user is learning it.
      masteryLevel: progress.masteryLevel,
      reviewCount: progress.reviewCount,
      nextReviewAt: progress.nextReviewAt.toISOString(),
    };
  }
}
