export type ObjectValues<T> = T[keyof T];

export type Constructor<T = any, Arguments extends unknown[] = any[]> = new (
  ...arguments_: Arguments
) => T;
