import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  InjectLearningReadRepository,
  type ILearningReadRepository,
} from '../../../learning/progress/application/repositories/learning-read.repository.interface';
import {
  InjectWordReadRepository,
  type IWordReadRepository,
} from '../../domain/repositories/word-read.repository.interface';
import { WordSenseSearchResultResponseDto } from '../../dto/responses/word-sense-search-result.response.dto';
import { SearchWordSensesQuery } from './search-word-senses.query';

@QueryHandler(SearchWordSensesQuery)
export class SearchWordSensesHandler implements IQueryHandler<SearchWordSensesQuery> {
  constructor(
    @InjectWordReadRepository()
    private readonly wordRepo: IWordReadRepository,
    @InjectLearningReadRepository()
    private readonly learningRepo: ILearningReadRepository,
  ) {}

  async execute(
    query: SearchWordSensesQuery,
  ): Promise<{ data: WordSenseSearchResultResponseDto[]; count: number }> {
    const { data: searchItems, count } = await this.wordRepo.searchByPrefix(
      query.query,
      query.top,
      query.skip,
    );

    let learnedSenseIds = new Set<string>();

    if (query.userId && searchItems.length > 0) {
      const senseIds = searchItems.map((item) => item.senseId);
      const learnedIdsList = await this.learningRepo.checkLearnedStatus(
        query.userId,
        senseIds,
      );

      learnedSenseIds = new Set(learnedIdsList);
    }
    // Sort: exact match first, then by text length
    const sorted = searchItems.sort((a, b) => {
      const queryLower = query.query.toLowerCase();

      if (a.normalizedText === queryLower) return -1;
      if (b.normalizedText === queryLower) return 1;

      return a.normalizedText.length - b.normalizedText.length;
    });

    // Map read-side items → response DTOs
    const data: WordSenseSearchResultResponseDto[] = sorted.map((item) => ({
      senseId: item.senseId,
      wordText: item.wordText,
      normalizedText: item.normalizedText,
      partOfSpeech: item.partOfSpeech,
      shortDefinition: item.shortDefinition,
      definition: item.definition,
      definitionVi: item.definitionVi,
      cefrLevel: item.cefrLevel,
      isLearned: query.userId ? learnedSenseIds.has(item.senseId) : undefined,
      pronunciations: item.pronunciations.map((pronunciation) => ({
        ipa: pronunciation.ipa,
        audioUrl: pronunciation.audioUrl || '',
        region: pronunciation.region,
      })),
    }));

    return { data, count };
  }
}
