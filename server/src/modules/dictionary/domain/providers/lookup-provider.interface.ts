import { createInjection } from '@shared/utils';
import { Word } from '../entities/word.aggregate';

export type RawResponse = any;

/**
 * Generic enrichment context — domain knows enrichment is a capability,
 * but doesn't know provider-specific details (e.g. AzVocab defIds).
 */
export interface EnrichmentContext {
  searchData: unknown;
  fetchedDefIds: string[];
}

export interface LookupResult {
  words: Word[];
  raw: RawResponse;
  status: number;
  enrichmentContext?: EnrichmentContext;
}

export interface ILookupProvider {
  readonly name: string;
  lookup(word: string): Promise<LookupResult>;
  enrichRemaining(word: string, context: EnrichmentContext): Promise<Word[]>;
  toDomain(raw: any): Word[];
  isAvailable(): Promise<boolean>;
}

const { inject, provider, token } =
  createInjection<ILookupProvider>('ILookupProvider');

export const InjectLookupProvider = inject;
export const provideLookupProvider = provider;
export const lookupProviderToken = token;
