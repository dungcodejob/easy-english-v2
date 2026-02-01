import { createInjection } from '@shared/utils';

export interface IPasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashed: string): Promise<boolean>;
}

const { token, inject, provider } =
  createInjection<IPasswordHasher>('IPasswordHasher');

export const InjectPasswordHasher = inject;
export const passwordHasherToken = token;
export const passwordHasherProvider = provider;
