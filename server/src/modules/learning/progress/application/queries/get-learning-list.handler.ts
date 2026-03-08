import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { ILearningReadRepository } from '../../domain/repositories/learning-read.repository.interface';
import { InjectLearningReadRepository } from '../../domain/repositories/learning-read.repository.interface';
import { LearningListItemResponseDto } from '../../dto/responses/learning-list-item.response.dto';
import { GetLearningListQuery } from './get-learning-list.query';

@QueryHandler(GetLearningListQuery)
export class GetLearningListHandler implements IQueryHandler<GetLearningListQuery> {
  constructor(
    @InjectLearningReadRepository()
    private readonly learningRepo: ILearningReadRepository,
  ) {}

  async execute(
    query: GetLearningListQuery,
  ): Promise<{ data: LearningListItemResponseDto[]; count: number }> {
    const { data: records, count } = await this.learningRepo.findLearningList(
      query.userId,
      query.top,
      query.skip,
    );

    const data: LearningListItemResponseDto[] = records.map((record) => {
      return {
        id: record.id,
        senseId: record.senseId,
        wordText: record.wordText,
        definition: record.definition,
        shortDefinition: record.shortDefinition || null,
        partOfSpeech: record.partOfSpeech,
        definitionVi: record.definitionVi || null,
        pronunciations: record.pronunciations.map((p) => ({
          ipa: p.ipa,
          audioUrl: p.audioUrl || null,
          region: p.region,
        })),
        isLearning: record.isLearning,
        masteryLevel: record.masteryLevel,
        reviewCount: record.reviewCount,
        nextReviewAt: record.nextReviewAt || null,
        lastReviewedAt: record.lastReviewedAt || null,
        createdAt: record.createdAt,
      };
    });

    return { data, count };
  }
}
