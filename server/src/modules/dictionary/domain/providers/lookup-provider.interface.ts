import { createInjection } from '@shared/utils';
import { WordSnapshot } from '../value-objects/word-snapshot.vo';

export type RawResponse = any;

export interface LookupResult {
  snapshots: WordSnapshot[];
  raw: RawResponse;
  status: number;
}

export interface ILookupProvider {
  readonly name: string;
  lookup(word: string): Promise<LookupResult>;
  toDomain(raw: any): WordSnapshot[];
  isAvailable(): Promise<boolean>;
}

const { inject, provider, token } =
  createInjection<ILookupProvider>('ILookupProvider');

export const InjectLookupProvider = inject;
export const provideLookupProvider = provider;
export const lookupProviderToken = token;
