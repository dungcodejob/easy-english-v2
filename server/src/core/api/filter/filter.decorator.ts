import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { parseFilter } from './filter.parser';
import { FilterNode } from './filter.types';

/**
 * Parsed filter result for use in controller methods
 */
export interface FilterParams {
  /** Parsed filter AST, undefined if no filter provided */
  filter?: FilterNode;
  /** Raw filter string */
  filterRaw?: string;
}

/**
 * Parameter decorator to extract and parse $filter query parameter
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiFilterParam()
 * async findAll(@FilterParam() params: FilterParams) {
 *   if (params.filter) {
 *     // Use the parsed AST
 *   }
 * }
 * ```
 */
export const FilterParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): FilterParams => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const filterStr = request.query['$filter'] as string | undefined;

    if (!filterStr) {
      return {};
    }

    const filter = parseFilter(filterStr);
    return {
      filter,
      filterRaw: filterStr,
    };
  },
);

/**
 * Swagger documentation decorator for $filter query parameter
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiFilterParam()
 * async findAll(@FilterParam() params: FilterParams) { ... }
 * ```
 */
export function ApiFilterParam() {
  return applyDecorators(
    ApiQuery({
      name: '$filter',
      required: false,
      type: String,
      description: `OData-style filter expression.
Comparison operators: eq, ne, gt, ge, lt, le
Logical operators: and, or, not
String functions: contains(), startswith(), endswith()
Examples:
  - status eq 'active'
  - price gt 100 and price lt 500
  - contains(name, 'test') and status ne 'deleted'
  - (status eq 'active' or status eq 'pending') and createdAt gt 2024-01-01`,
      example: "status eq 'active' and contains(name, 'test')",
    }),
  );
}
