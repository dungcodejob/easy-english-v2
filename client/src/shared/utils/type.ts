import type { Dispatch, SetStateAction } from 'react';

export type ObjectValues<T> = T[keyof T];

export type SetState<T> = Dispatch<SetStateAction<T>>;

export function isNotNil<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
export function isNil<T>(
  value: T | null | undefined,
): value is null | undefined {
  return !isNotNil(value);
}

export function isNotNilOrEmpty<T>(value: T | null | undefined): value is T {
  return isNotNil(value) && value !== '';
}

export function isNotNilOrEmptyArray<T>(
  value: T[] | null | undefined,
): value is T[] {
  return isNotNil(value) && value.length > 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;
