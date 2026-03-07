import { Inject, Provider, Type } from '@nestjs/common';
import { TokenType } from './token-generator.interface';

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
  providerClasses: Type<ITokenStrategy<any>>[],
): Provider[] => {
  console.log(providerClasses);
  return [
    ...providerClasses,
    {
      provide: tokenStrategyToken,
      useFactory: (...strategies: ITokenStrategy<any>[]) => strategies,

      inject: providerClasses,
    },
  ];
};
