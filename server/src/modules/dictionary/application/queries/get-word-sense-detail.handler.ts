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

    const { sense, wordText, normalizedText, pronunciations } = detail;

    // Convert WordSenseOrmEntity to DTO
    let learningState: LearningStateDto | undefined = undefined;

    // Fetch learning progress if this user is authenticated (userId is not empty)
    if (query.userId) {
      const state = await this.queryBus.execute(
        new GetLearningStateQuery(query.userId, query.senseId),
      );
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
      senseId: sense.id,
      wordText: wordText,
      normalizedText: normalizedText,
      partOfSpeech: sense.partOfSpeech.value,
      definition: sense.definition,
      shortDefinition: sense.shortDefinition,
      cefrLevel: sense.cefrLevel?.value || null,
      definitionVi: sense.definitionVi,
      examples:
        sense.examples?.map((e) => ({
          text: e.text,
          translationVi: e.translationVi,
          order: e.order,
        })) || [],
      synonyms: sense.synonyms || [],
      antonyms: sense.antonyms || [],
      idioms: sense.idioms || [],
      phrases: sense.phrases || [],
      collocations: sense.collocations || null,
      pronunciations:
        pronunciations?.map((p) => ({
          ipa: p.ipa,
          audioUrl: p.audioUrl,
          region: p.region,
        })) || [],
      learningState: learningState || null,
    };
  }
}
