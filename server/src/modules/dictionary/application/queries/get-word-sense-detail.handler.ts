import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetWordSenseDetailQuery } from './get-word-sense-detail.query';
import { InjectWordReadRepository } from '../../domain/repositories/word-read.repository.interface';
import { WordSenseDetailResponseDto } from '../../dto/responses/word-sense-detail.response.dto';
import { CollocationDto } from '../../dto/responses/word.response.dto';

import type { IWordReadRepository } from '../../domain/repositories/word-read.repository.interface';

@QueryHandler(GetWordSenseDetailQuery)
export class GetWordSenseDetailHandler implements IQueryHandler<GetWordSenseDetailQuery> {
  constructor(
    @InjectWordReadRepository()
    private readonly wordRepo: IWordReadRepository,
  ) {}

  async execute(
    query: GetWordSenseDetailQuery,
  ): Promise<WordSenseDetailResponseDto> {
    const detail = await this.wordRepo.findSenseById(query.senseId);

    if (!detail) {
      throw new NotFoundException('WordSense not found');
    }

    // Convert WordSenseOrmEntity to DTO
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
      collocations: detail.collocations as CollocationDto,
      pronunciations: detail.pronunciations.map((p) => ({
        ipa: p.ipa,
        audioUrl: p.audioUrl || null,
        region: p.region,
      })),
    };
  }
}
