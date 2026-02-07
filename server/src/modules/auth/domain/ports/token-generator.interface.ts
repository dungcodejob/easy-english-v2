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
  verify(token: string): Promise<ITokenPayload>;
  decode(token: string): ITokenPayload | null;
}

const { inject, provider, token } =
  createInjection<ITokenGenerator>('ITokenGenerator');

export const InjectTokenGenerator = inject;
export const tokenGeneratorProvider = provider;
export const tokenGeneratorToken = token;
