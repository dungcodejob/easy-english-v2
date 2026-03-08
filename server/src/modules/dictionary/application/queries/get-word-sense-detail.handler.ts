import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetLearningStateQuery } from '../../../learning/application/queries/get-learning-state.query';
import type { IWordReadRepository } from '../../domain/repositories/word-read.repository.interface';
import { InjectWordReadRepository } from '../../domain/repositories/word-read.repository.interface';
import {
  LearningStateDto,
  WordSenseDetailResponseDto,
} from '../../dto/responses/word-sense-detail.response.dto';
import { GetWordSenseDetailQuery } from './get-word-sense-detail.query';

@QueryHandler(GetWordSenseDetailQuery)
export class GetWordSenseDetailHandler implements IQueryHandler<GetWordSenseDetailQuery> {
  constructor(
    @InjectWordReadRepository()
    private readonly wordRepo: IWordReadRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    query: GetWordSenseDetailQuery,
  ): Promise<WordSenseDetailResponseDto> {
    const detail = await this.wordRepo.findSenseById(query.senseId);

    if (!detail) {
      throw new NotFoundException('WordSense not found');
    }

    // Convert WordSenseOrmEntity to DTO
    let learningState: LearningStateDto | undefined = undefined;

    // Fetch learning progress if this user is authenticated (userId is not empty)
    if (query.userId) {
      const state = await this.queryBus.execute<
        GetLearningStateQuery,
        LearningStateDto | null
      >(new GetLearningStateQuery(query.userId, query.senseId));
      if (state) {
        learningState = {
          isLearning: state.isLearning,
          masteryLevel: state.masteryLevel,
          reviewCount: state.reviewCount,
          nextReviewAt: state.nextReviewAt,
        };
      }
    }

    return {
      senseId: detail.senseId,
      wordText: detail.wordText,
      normalizedText: detail.normalizedText,
      partOfSpeech: detail.partOfSpeech,
      definition: detail.definition,
      shortDefinition: detail.shortDefinition,
      cefrLevel: detail.cefrLevel,
      definitionVi: detail.definitionVi,
      examples: detail.examples.map((e) => ({
        text: e.text,
        translationVi: e.translationVi || null,
        order: e.order,
      })),
      synonyms: detail.synonyms,
      antonyms: detail.antonyms,
      idioms: detail.idioms,
      phrases: detail.phrases,
      collocations: detail.collocations,
      pronunciations: detail.pronunciations.map((p) => ({
        ipa: p.ipa,
        audioUrl: p.audioUrl || null,
        region: p.region,
      })),
      learningState: learningState || null,
    };
  }
}
