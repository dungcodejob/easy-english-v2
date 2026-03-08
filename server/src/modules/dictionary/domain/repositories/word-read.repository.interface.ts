import { createInjection } from '@shared/utils';
import { Word } from '../entities/word.aggregate';

export interface WordSenseSearchReadModel {
  senseId: string;
  wordText: string;
  normalizedText: string;
  partOfSpeech: string;
  definition: string;
  definitionVi: string | null;
  shortDefinition: string | null;
  cefrLevel: string | null;
}

export interface WordSenseDetailReadModel {
  senseId: string;
  wordText: string;
  normalizedText: string;
  partOfSpeech: string;
  definition: string;
  shortDefinition: string | null;
  cefrLevel: string | null;
  definitionVi: string | null;
  examples: { text: string; translationVi: string | null; order: number }[];
  synonyms: string[];
  antonyms: string[];
  idioms: string[];
  phrases: string[];
  collocations: any | null;
  pronunciations: { ipa: string; audioUrl: string | null; region: string }[];
}

export interface IWordReadRepository {
  findByWord(normalizedWord: string): Promise<Word[]>;
  searchByPrefix(
    query: string,
    top: number,
    skip: number,
  ): Promise<{ data: WordSenseSearchReadModel[]; count: number }>;
  findSenseById(senseId: string): Promise<WordSenseDetailReadModel | null>;
}

const { inject, provider, token } = createInjection<IWordReadRepository>(
  'IWordReadRepository',
);

export const InjectWordReadRepository = inject;
export const provideWordReadRepository = provider;
export const wordReadRepositoryToken = token;
