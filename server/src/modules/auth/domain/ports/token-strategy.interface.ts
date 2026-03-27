import { Inject, type Provider, type Type } from '@nestjs/common';

import {
  type ITokenPayload,
  type TokenType,
} from './token-generator.interface';

export interface ITokenStrategy<TPayload = Record<string, unknown>> {
  readonly type: TokenType;
  sign(payload: TPayload): Promise<string>;
  verify(token: string): Promise<TPayload>;
  decode(token: string): TPayload | null;
}

export const tokenStrategyToken = Symbol('ITokenStrategy');

export const InjectTokenStrategy = () => {
  return Inject(tokenStrategyToken);
};
export const provideTokenStrategies = (
  providerClasses: Type<ITokenStrategy<ITokenPayload>>[],
): Provider[] => {
  return [
    ...providerClasses,
    {
      provide: tokenStrategyToken,
      useFactory: (...strategies: ITokenStrategy<ITokenPayload>[]) =>
        strategies,

      inject: providerClasses,
    },
  ];
};
