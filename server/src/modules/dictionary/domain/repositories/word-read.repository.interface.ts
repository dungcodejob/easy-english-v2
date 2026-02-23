import { createInjection } from '@shared/utils';
import { WordSnapshot } from '../value-objects/word-snapshot.vo';

export interface IWordReadRepository {
  findByWord(normalizedWord: string, tenantId: string): Promise<WordSnapshot[]>;
}

const { inject, provider, token } = createInjection<IWordReadRepository>(
  'IWordReadRepository',
);

export const InjectWordReadRepository = inject;
export const provideWordReadRepository = provider;
export const wordReadRepositoryToken = token;
