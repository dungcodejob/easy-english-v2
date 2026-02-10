import { WordSnapshot } from '../value-objects/word-snapshot.vo';

export interface ILookupProvider {
  readonly name: string;
  lookup(word: string): Promise<WordSnapshot | null>;
  isAvailable(): Promise<boolean>;
}

export const LOOKUP_PROVIDER = Symbol('LOOKUP_PROVIDER');
