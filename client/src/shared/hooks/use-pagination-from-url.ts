import { useNavigate, useSearch } from '@tanstack/react-router';
import { z } from 'zod';
import { URLParamKeys } from '../constants';
import { cleanEmptyParams } from '../utils';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;

const paginationSchema = z.object({
  [URLParamKeys.pageIndex]: z.coerce
    .number()
    .int()
    .positive()
    .catch(DEFAULT_PAGE),
  [URLParamKeys.pageSize]: z.coerce
    .number()
    .int()
    .positive()
    .catch(DEFAULT_PAGE_SIZE),
});

export function usePaginationFromUrl() {
  const navigate = useNavigate();
  const { page, pageSize } = useSearch({
    select: (search: Record<string, unknown>) => {
      const parsed = paginationSchema.parse({
        [URLParamKeys.pageIndex]: search[URLParamKeys.pageIndex],
        [URLParamKeys.pageSize]: search[URLParamKeys.pageSize],
      });
      return {
        page: parsed[URLParamKeys.pageIndex],
        pageSize: parsed[URLParamKeys.pageSize],
      };
    },
    from: '__root__',
  });

  const setPagination = (newPage: number, newPageSize?: number) => {
    navigate({
      // @ts-ignore
      search: (prev) =>
        cleanEmptyParams({
          ...prev,
          [URLParamKeys.pageIndex]: String(newPage),
          [URLParamKeys.pageSize]: String(newPageSize ?? DEFAULT_PAGE_SIZE),
        }),
    });
  };

  return {
    page,
    pageSize,
    top: pageSize,
    skip: (page - 1) * pageSize,
    setPagination,
  };
}
