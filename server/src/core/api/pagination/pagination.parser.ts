import {
  PaginationInvalidSkipException,
  PaginationInvalidTopException,
} from './pagination.exception';
import { type PaginationInput } from './pagination.types';

/**
 * Default values
 */
export const QUERY_DEFAULTS = {
  TOP: 20,
  MAX_TOP: 100,
  MIN_TOP: 1,
  SKIP: 0,
  COUNT: false,
} as const;

/**
 * Parse a $filter string into a FilterNode AST
 */
export function parsePagination(input: PaginationInput): {
  top: number;
  skip: number;
  count: boolean;
} {
  // Parse pagination
  const top = input.top ?? QUERY_DEFAULTS.TOP;

  if (top < QUERY_DEFAULTS.MIN_TOP || top > QUERY_DEFAULTS.MAX_TOP) {
    throw new PaginationInvalidTopException(
      `$top must be between ${QUERY_DEFAULTS.MIN_TOP} and ${QUERY_DEFAULTS.MAX_TOP}`,
    );
  }

  const skip = input.skip ?? QUERY_DEFAULTS.SKIP;

  if (skip < 0) {
    throw new PaginationInvalidSkipException('$skip must be >= 0');
  }

  const count = input.count ?? QUERY_DEFAULTS.COUNT;

  return { top, skip, count };
}
