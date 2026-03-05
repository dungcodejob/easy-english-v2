import { createInjection } from '@shared/utils';
import { Word } from '../entities/word.aggregate';

export interface WordSenseSearchResult {
  senseId: string;
  wordText: string;
  normalizedText: string;
  partOfSpeech: string;
  shortDefinition: string | null;
  cefrLevel: string | null;
}

export interface IWordReadRepository {
  findByWord(normalizedWord: string): Promise<Word[]>;
  searchByPrefix(
    query: string,
    top: number,
    skip: number,
  ): Promise<{ data: WordSenseSearchResult[]; count: number }>;
  findSenseById(senseId: string): Promise<any>;
}

const { inject, provider, token } = createInjection<IWordReadRepository>(
  'IWordReadRepository',
);

export const InjectWordReadRepository = inject;
export const provideWordReadRepository = provider;
export const wordReadRepositoryToken = token;
