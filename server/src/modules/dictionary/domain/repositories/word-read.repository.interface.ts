import { createInjection } from '@shared/utils';
import { WordSenseEntity } from '../entities/word-sense.entity';
import { Word } from '../entities/word.aggregate';

export interface WordSenseSearchItem {
  sense: WordSenseEntity;
  wordText: string;
  normalizedText: string;
}

export interface WordSenseDetailItem {
  sense: WordSenseEntity;
  wordText: string;
  normalizedText: string;
  pronunciations: any[];
}

export interface IWordReadRepository {
  findByWord(normalizedWord: string): Promise<Word[]>;
  searchByPrefix(
    query: string,
    top: number,
    skip: number,
  ): Promise<{ data: WordSenseSearchItem[]; count: number }>;
  findSenseById(senseId: string): Promise<WordSenseDetailItem | null>;
}

const { inject, provider, token } = createInjection<IWordReadRepository>(
  'IWordReadRepository',
);

export const InjectWordReadRepository = inject;
export const provideWordReadRepository = provider;
export const wordReadRepositoryToken = token;
