import type { Dispatch, SetStateAction } from "react";

export type ObjectValues<T> = T[keyof T];


export type SetState<T> = Dispatch<SetStateAction<T>>;

export type SelectOption = {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export function isNotNil<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
export function isNil<T>(value: T | null | undefined): value is null | undefined {
  return !isNotNil(value);
}

export function isNotNilOrEmpty<T>(value: T | null | undefined): value is T {
  return isNotNil(value) && value !== '';
}

export function isNotNilOrEmptyArray<T>(value: T[] | null | undefined): value is T[] {
  return isNotNil(value) && value.length > 0;
}
