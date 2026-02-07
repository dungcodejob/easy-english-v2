import { createInjection } from '@shared/utils';

export interface ITokenPayload {
  userId: string;
  tenantId: string;
  email: string;
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export interface ITokenGenerator {
  sign(payload: ITokenPayload, tokenType: TokenType): Promise<string>;
  verify(token: string, tokenType: TokenType): Promise<ITokenPayload>;
  decode(token: string): ITokenPayload | null;
}

const { inject, provider, token } =
  createInjection<ITokenGenerator>('ITokenGenerator');

export const injectTokenGenerator = inject;
export const tokenGeneratorProvider = provider;
export const tokenGeneratorToken = token;
