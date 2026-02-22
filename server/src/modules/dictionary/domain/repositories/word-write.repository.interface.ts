import { createInjection } from '@shared/utils';
import { WordSnapshot } from '../value-objects/word-snapshot.vo';

export interface IWordWriteRepository {
  save(snapshot: WordSnapshot, tenantId: string): Promise<void>;
}

const { inject, provider, token } = createInjection<IWordWriteRepository>(
  'IWordWriteRepository',
);

export const InjectWordWriteRepository = inject;
export const provideWordWriteRepository = provider;
export const wordWriteRepositoryToken = token;
