import { WordSnapshot } from '../value-objects/word-snapshot.vo';

export interface IWordReadRepository {
  findByWord(
    normalizedWord: string,
    tenantId: string,
  ): Promise<WordSnapshot | null>;
}

export const WORD_READ_REPOSITORY = Symbol('WORD_READ_REPOSITORY');
