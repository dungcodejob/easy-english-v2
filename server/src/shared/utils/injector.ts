import { Inject, Provider, Type } from '@nestjs/common';

export const createInjection = <T>(name: string) => {
  const token = Symbol(name);
  const inject = () => Inject(token);

  const provider = (providerClass: Type<T>): Provider<T> => {
    return {
      provide: token,
      useClass: providerClass,
    };
  };

  return {
    token,
    inject,
    provider,
  };
};
