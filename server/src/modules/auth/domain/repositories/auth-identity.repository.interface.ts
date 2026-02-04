import { createInjection } from '@shared/utils';
import { AuthIdentity } from '../entities';

export interface IAuthIdentityRepository {
  persist(identity: AuthIdentity): void;
  findByProviderAndProviderUserId(
    provider: string,
    providerUserId: string,
  ): Promise<AuthIdentity | null>;
}

const { inject, provider, token } = createInjection<IAuthIdentityRepository>(
  'IAuthIdentityRepository',
);

export const InjectAuthIdentityRepository = inject;
export const authIdentityRepositoryProvider = provider;
export const authIdentityRepositoryToken = token;
