import { createInjection } from '@shared/utils';
import { UserOrmEntity } from '../../infrastructure/persistence/user.orm-entity';

export interface IUserRepository {
  create(user: UserOrmEntity): UserOrmEntity;
  persist(user: UserOrmEntity): void;
  findByEmail(email: string): Promise<UserOrmEntity | null>;
}

const { inject, provider, token } =
  createInjection<IUserRepository>('IUserRepository');

export const injectUserRepository = inject;
export const userRepositoryProvider = provider;
export const userRepositoryToken = token;
