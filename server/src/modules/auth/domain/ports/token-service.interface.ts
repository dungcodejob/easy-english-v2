import { createInjection } from '@shared/utils';
import { TokenType } from './token-generator.interface';

export interface ITokenService {
  sign<T>(type: TokenType, payload: T): Promise<string>;
  verify<T>(type: TokenType, token: string): Promise<T>;
  decode<T>(type: TokenType, token: string): T | null;
}

const { inject, provider, token } =
  createInjection<ITokenService>('ITokenService');

export const InjectTokenService = inject;
export const provideTokenService = provider;
export const tokenServiceToken = token;
