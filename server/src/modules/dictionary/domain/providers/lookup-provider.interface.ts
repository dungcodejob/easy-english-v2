import { createInjection } from '@shared/utils';
import { Word } from '../entities/word.aggregate';

export type RawResponse = any;

export interface LookupResult {
  words: Word[];
  raw: RawResponse;
  status: number;
}

export interface ILookupProvider {
  readonly name: string;
  lookup(word: string): Promise<LookupResult>;
  toDomain(raw: any): Word[];
  isAvailable(): Promise<boolean>;
}

const { inject, provider, token } =
  createInjection<ILookupProvider>('ILookupProvider');

export const InjectLookupProvider = inject;
export const provideLookupProvider = provider;
export const lookupProviderToken = token;
