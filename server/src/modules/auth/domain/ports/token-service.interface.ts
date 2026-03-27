import { createInjection } from '@shared/utils';

import {
  type ITokenPayload,
  type TokenType,
} from './token-generator.interface';

export interface ITokenService {
  sign<T extends ITokenPayload>(type: TokenType, payload: T): Promise<string>;
  verify<T extends ITokenPayload>(type: TokenType, token: string): Promise<T>;
  decode<T extends ITokenPayload>(type: TokenType, token: string): T | null;
}

const { inject, provider, token } =
  createInjection<ITokenService>('ITokenService');

export const InjectTokenService = inject;
export const provideTokenService = provider;
export const tokenServiceToken = token;
