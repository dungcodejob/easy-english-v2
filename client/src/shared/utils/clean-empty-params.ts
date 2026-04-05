import { PAGE_SIZE_DEFAULT } from '../constants';

export const cleanEmptyParams = <
  T extends Record<string, unknown> & { pageIndex?: number; pageSize?: number },
>(
  search: T,
) => {
  const newSearch = { ...search };
  if ('pageIndex' in newSearch && newSearch.pageIndex === 0) {
    newSearch.pageIndex = undefined;
  }
  if ('pageSize' in newSearch && newSearch.pageSize === PAGE_SIZE_DEFAULT) {
    newSearch.pageSize = undefined;
  }
  for (const key of Object.keys(newSearch)) {
    const value = newSearch[key];
    if (
      value === undefined ||
      value === '' ||
      (typeof value === 'number' && Number.isNaN(value))
    )
      delete newSearch[key];
  }

  return newSearch;
};
