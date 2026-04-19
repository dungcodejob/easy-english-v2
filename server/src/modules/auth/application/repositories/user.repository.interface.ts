import { createInjection } from '@shared/utils';

import { type User } from '../../domain/entities';

export interface IUserRepository {
  persist(user: User): void;
  findByEmail(email: string): Promise<User | null>;
}

const { inject, provider, token } =
  createInjection<IUserRepository>('IUserRepository');

export const InjectUserRepository = inject;
export const provideUserRepository = provider;
export const userRepositoryToken = token;
