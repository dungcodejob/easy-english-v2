import { createInjection } from '@shared/utils';
import { Word } from '../entities/word.aggregate';

export interface IWordWriteRepository {
  save(word: Word): Promise<void>;
}

const { inject, provider, token } = createInjection<IWordWriteRepository>(
  'IWordWriteRepository',
);

export const InjectWordWriteRepository = inject;
export const provideWordWriteRepository = provider;
export const wordWriteRepositoryToken = token;
