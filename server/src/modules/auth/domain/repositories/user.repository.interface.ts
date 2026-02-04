import { createInjection } from '@shared/utils';
import { User } from '../entities';

export interface IUserRepository {
  persist(user: User): void;
  findByEmail(email: string): Promise<User | null>;
}

const { inject, provider, token } =
  createInjection<IUserRepository>('IUserRepository');

export const InjectUserRepository = inject;
export const userRepositoryProvider = provider;
export const userRepositoryToken = token;
