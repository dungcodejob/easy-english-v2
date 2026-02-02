import { AuthIdentityOrmEntity } from '../../infrastructure/persistence/auth-identity.orm-entity';

export interface IAuthIdentityRepository {
  create(identity: AuthIdentityOrmEntity): AuthIdentityOrmEntity;
  persist(identity: AuthIdentityOrmEntity): void;
  findByProviderAndProviderUserId(
    provider: string,
    providerUserId: string,
  ): Promise<AuthIdentityOrmEntity | null>;
}
