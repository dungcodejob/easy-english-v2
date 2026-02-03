import { createInjection } from '@shared/utils';
import { AuthIdentityOrmEntity } from '../../infrastructure/persistence/auth-identity.orm-entity';

export interface IAuthIdentityRepository {
  create(identity: AuthIdentityOrmEntity): AuthIdentityOrmEntity;
  persist(identity: AuthIdentityOrmEntity): void;
  findByProviderAndProviderUserId(
    provider: string,
    providerUserId: string,
  ): Promise<AuthIdentityOrmEntity | null>;
}

const { inject, provider, token } = createInjection<IAuthIdentityRepository>(
  'IAuthIdentityRepository',
);

export const injectAuthIdentityRepository = inject;
export const authIdentityRepositoryProvider = provider;
export const authIdentityRepositoryToken = token;
