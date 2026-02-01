import { Inject, Type } from '@nestjs/common';

export const createInjection = <T>(name: string) => {
  const token = Symbol(name);
  const inject = () => Inject(token);

  const provider = (providerClass: Type<T>) => {
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
