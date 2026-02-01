import { AuthIdentityOrmEntity } from '../../infrastructure/persistence/auth-identity.orm-entity';

export interface IAuthIdentityRepository {
  create(identity: AuthIdentityOrmEntity): AuthIdentityOrmEntity;
  persist(identity: AuthIdentityOrmEntity): void;
  findByProviderAndUserId(
    provider: string,
    userId: string,
  ): Promise<AuthIdentityOrmEntity | null>;
}
