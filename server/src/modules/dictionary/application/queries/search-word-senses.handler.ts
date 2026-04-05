import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SearchWordSensesQuery } from './search-word-senses.query';
import {
  InjectWordReadRepository,
  type IWordReadRepository,
} from '../../domain/repositories/word-read.repository.interface';
import { WordSenseSearchResultResponseDto } from '../../dto/responses/word-sense-search-result.response.dto';

@QueryHandler(SearchWordSensesQuery)
export class SearchWordSensesHandler implements IQueryHandler<SearchWordSensesQuery> {
  constructor(
    @InjectWordReadRepository()
    private readonly wordRepo: IWordReadRepository,
  ) {}

  async execute(
    query: SearchWordSensesQuery,
  ): Promise<{ data: WordSenseSearchResultResponseDto[]; count: number }> {
    const { data: searchItems, count } = await this.wordRepo.searchByPrefix(
      query.query,
      query.top,
      query.skip,
    );

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
    }));

    return { data, count };
  }
}
