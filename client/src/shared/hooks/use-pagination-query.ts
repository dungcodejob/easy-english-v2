import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { usePaginationFromUrl } from './use-pagination-from-url';

export interface PaginationParams {
  page: number;
  pageSize: number;
  top: number;
  skip: number;
}

/** Mirrors the `pagination` field of ApiSuccessResponse. */
export interface PaginationMeta {
  top: number;
  count?: number;
  hasMore: boolean;
  skip?: number;
  nextLink?: string;
}

interface UsePaginationQueryOptions<TData, TError = Error> extends Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn' | 'placeholderData'
> {
  queryKey: (params: PaginationParams) => readonly unknown[];
  queryFn: (params: Pick<PaginationParams, 'top' | 'skip'>) => Promise<TData>;
}

function extractPaginationMeta(data: unknown): PaginationMeta | undefined {
  if (data != null && typeof data === 'object' && 'pagination' in data) {
    return (data as { pagination?: PaginationMeta }).pagination;
  }
  return undefined;
}

/**
 * Reusable paginated data-fetching hook.
 *
 * - URL is the single source of truth for page / pageSize (via usePaginationFromUrl).
 * - setPage changes only the page.
 * - setPageSize resets to page 1 to avoid empty result sets.
 * - placeholderData prevents UI flicker between page transitions.
 * - When TData is ApiSuccessResponse<X>, count/hasMore/paginationMeta are
 *   automatically extracted from data.pagination.
 */
export function usePaginationQuery<TData, TError = Error>({
  queryKey,
  queryFn,
  ...queryOptions
}: UsePaginationQueryOptions<TData, TError>) {
  const { page, pageSize, top, skip, setPagination } = usePaginationFromUrl();

  const params: PaginationParams = { page, pageSize, top, skip };

  const query = useQuery<TData, TError>({
    ...queryOptions,
    queryKey: queryKey(params),
    queryFn: () => queryFn({ top, skip }),
    placeholderData: (previousData) => previousData,
  });

  const setPage = (newPage: number) => setPagination(newPage, pageSize);
  const setPageSize = (newPageSize: number) => setPagination(1, newPageSize);

  const paginationMeta = extractPaginationMeta(query.data);

  return {
    ...query,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalPages: Math.ceil((paginationMeta?.count ?? 0) / pageSize) || 0,
    /** Total item count reported by the server (undefined if API omits it). */
    count: paginationMeta?.count,
    /** Whether more pages exist after the current one. */
    hasPrev: page > 1,
    hasMore: paginationMeta?.hasMore ?? false,
    /** Full pagination envelope from ApiSuccessResponse.pagination, if present. */
    paginationMeta,
  };
}
