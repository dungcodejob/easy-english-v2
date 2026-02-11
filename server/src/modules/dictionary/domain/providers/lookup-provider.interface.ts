import { createInjection } from '@shared/utils';
import { WordSnapshot } from '../value-objects/word-snapshot.vo';

export interface LookupResult {
  snapshot: WordSnapshot | null;
  raw: any;
  status: number;
}

export interface ILookupProvider {
  readonly name: string;
  lookup(word: string): Promise<LookupResult>;
  mapResponse(raw: any): WordSnapshot | null;
  isAvailable(): Promise<boolean>;
}

const { inject, provider, token } =
  createInjection<ILookupProvider>('ILookupProvider');

export const InjectLookupProvider = inject;
export const provideLookupProvider = provider;
export const lookupProviderToken = token;
