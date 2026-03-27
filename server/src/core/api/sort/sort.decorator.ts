import {
  applyDecorators,
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { type Request } from 'express';

import { parseOrderBy } from './sort-parser';
import { type SortEntry } from './sort.types';

/**
 * Parsed sort result for use in controller methods
 */
export interface SortParams {
  /** Parsed sort entries */
  sort: SortEntry[];
  /** Raw orderby string */
  sortRaw?: string;
}

/**
 * Parameter decorator to extract and parse $orderby query parameter
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiSortParam()
 * async findAll(@SortParam() params: SortParams) {
 *   if (params.sort.length > 0) {
 *     // Apply sorting
 *   }
 * }
 * ```
 */
export const SortParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SortParams => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const orderbyStr = request.query.$orderby as string | undefined;

    if (!orderbyStr) {
      return { sort: [] };
    }

    const sort = parseOrderBy(orderbyStr);

    return {
      sort,
      sortRaw: orderbyStr,
    };
  },
);

/**
 * Swagger documentation decorator for $orderby query parameter
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiSortParam()
 * async findAll(@SortParam() params: SortParams) { ... }
 * ```
 */
export function ApiSortParam() {
  return applyDecorators(
    ApiQuery({
      name: '$orderby',
      required: false,
      type: String,
      description: `Comma-separated list of fields to sort by.
Each field can have an optional direction (asc or desc). Default direction is asc.
Examples:
  - createdAt desc
  - name asc, createdAt desc
  - price, name desc`,
      example: 'createdAt desc, name asc',
    }),
  );
}
