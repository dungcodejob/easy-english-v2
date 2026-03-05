import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
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
  ) {}

  async execute(
    query: SearchWordSensesQuery,
  ): Promise<{ data: WordSenseSearchResultResponseDto[]; count: number }> {
    const { data: dbData, count } = await this.wordRepo.searchByPrefix(
      query.query,
      query.top,
      query.skip,
    );

    // Provide some primitive sorting: exact match first, then by frequency/length.
    // For now we just return from DB and maybe sort by length of text to show exact match first
    const sortedData = dbData.sort((a, b) => {
      if (a.normalizedText === query.query.toLowerCase()) return -1;
      if (b.normalizedText === query.query.toLowerCase()) return 1;
      return a.normalizedText.length - b.normalizedText.length;
    });

    const data: WordSenseSearchResultResponseDto[] = sortedData.map((d) => ({
      senseId: d.senseId,
      wordText: d.wordText,
      normalizedText: d.normalizedText,
      partOfSpeech: d.partOfSpeech,
      shortDefinition: d.shortDefinition,
      cefrLevel: d.cefrLevel,
    }));

    return { data, count };
  }
}
