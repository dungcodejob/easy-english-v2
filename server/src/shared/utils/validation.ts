export const isUndefined = (value: unknown): value is undefined =>
  typeof value === 'undefined';

export const isNull = (value: unknown): value is null => value === null;

export const isNil = (value: unknown): value is null | undefined =>
  isUndefined(value) || isNull(value);

export const isEmpty = (value: unknown): boolean => {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return false;
  }
  if (typeof value === 'undefined' || value === null) {
    return true;
  }
  if (value instanceof Date) {
    return false;
  }
  if (value instanceof Object && !Object.keys(value).length) {
    return true;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return true;
    }
    if (value.every((item) => isEmpty(item))) {
      return true;
    }
  }
  if (value === '') {
    return true;
  }

  return false;
};

export const isNotEmpty = (value: unknown): boolean => !isEmpty(value);

export const lengthIsBetween = (
  value: number | string | unknown[],
  min: number,
  max: number,
): boolean => {
  if (isEmpty(value)) {
    throw new Error('Cannot check length of a value. Provided value is empty');
  }
  const valueLength =
    typeof value === 'number' ? Number(value).toString().length : value.length;

  if (valueLength >= min && valueLength <= max) {
    return true;
  }

  return false;
};
