import { ApplicationException } from '@core/exceptions';
import { FilterParseException } from './filter/filter.exception';
import { parseFilter } from './filter/filter.parser';
import { FilterInput, FilterNode } from './filter/filter.types';
import { PaginationParseException } from './pagination/pagination.exception';
import { parsePagination } from './pagination/pagination.parser';
import { PaginationInput } from './pagination/pagination.types';
import { parseOrderBy } from './sort/sort-parser';
import { SortParseException } from './sort/sort.exception';
import { SortEntry, SortInput } from './sort/sort.types';

/**
 * Combined query parameters for list endpoints
 * Includes pagination, filtering, and sorting
 */
export interface QueryParamsInput
  extends PaginationInput, FilterInput, SortInput {}

/**
 * Parsed query parameters ready for use in queries
 */
export interface ParsedQueryParams {
  // Pagination
  top: number;
  skip: number;
  count: boolean;
  skiptoken?: string;

  // Filter (parsed AST)
  filter?: FilterNode;
  filterRaw?: string;

  // Sort (parsed entries)
  sort: SortEntry[];
  sortRaw?: string;
}

export class QueryParseException extends ApplicationException {
  constructor(
    message: string,
    public readonly code: string,
    public readonly position?: number,
  ) {
    super(message, code, { position });
    this.name = 'QueryParseException';
  }
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams(input: QueryParamsInput): ParsedQueryParams {
  try {
    const { top, skip, count } = parsePagination(input);

    // Parse filter
    let filter: FilterNode | undefined;
    let filterRaw: string | undefined;
    if (input.$filter) {
      filter = parseFilter(input.$filter);
      filterRaw = input.$filter;
    }

    // Parse sort
    let sort: SortEntry[] = [];
    let sortRaw: string | undefined;
    if (input.$orderby) {
      sort = parseOrderBy(input.$orderby);
      sortRaw = input.$orderby;
    }

    return {
      top,
      skip,
      count,
      skiptoken: input.skiptoken,
      filter,
      filterRaw,
      sort,
      sortRaw,
    };
  } catch (e) {
    if (
      e instanceof FilterParseException ||
      e instanceof SortParseException ||
      e instanceof PaginationParseException
    ) {
      throw e;
    }

    throw new QueryParseException(
      'Invalid query parameters',
      'QUERY_PARSE_ERROR',
    );
  }
}
