import { createInjection } from '@shared/utils';

import { type ProviderResponseCacheOrmEntity } from '../../infrastructure/persistence/provider-response-cache.orm-entity';

export interface IProviderCacheRepository {
  findByWord(
    normalizedWord: string,
    provider: string,
  ): Promise<ProviderResponseCacheOrmEntity | null>;

  saveAsync(entity: ProviderResponseCacheOrmEntity): Promise<void>;
}

const { inject, provider, token } = createInjection<IProviderCacheRepository>(
  'IProviderCacheRepository',
);

export const InjectProviderCacheRepository = inject;
export const provideProviderCacheRepository = provider;
export const providerCacheRepositoryToken = token;
