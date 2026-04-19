import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { InjectLearningWriteRepository } from '../repositories/learning-write.repository.interface';
import { GetLearningStateQuery } from './get-learning-state.query';

import type { ILearningWriteRepository } from '../repositories/learning-write.repository.interface';

@QueryHandler(GetLearningStateQuery)
export class GetLearningStateHandler implements IQueryHandler<GetLearningStateQuery> {
  constructor(
    @InjectLearningWriteRepository()
    private readonly learningRepo: ILearningWriteRepository,
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
