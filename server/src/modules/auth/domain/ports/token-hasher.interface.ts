import { createInjection } from '@shared/utils/injector';

export interface ITokenHasher {
  hash(token: string): Promise<string>;
  compare(token: string, hashed: string): Promise<boolean>;
}

export const {
  inject: InjectTokenHasher,
  provider: provideTokenHasher,
  token: tokenHasherToken,
} = createInjection<ITokenHasher>('ITokenHasher');
