import { createInjection } from '@shared/utils';
import { Word } from '../entities/word.aggregate';

export interface IWordReadRepository {
  findByWord(normalizedWord: string, tenantId: string): Promise<Word[]>;
}

const { inject, provider, token } = createInjection<IWordReadRepository>(
  'IWordReadRepository',
);

export const InjectWordReadRepository = inject;
export const provideWordReadRepository = provider;
export const wordReadRepositoryToken = token;
