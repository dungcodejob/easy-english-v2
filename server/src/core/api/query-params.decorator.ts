import {
  applyDecorators,
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { type Request } from 'express';

import { QUERY_DEFAULTS } from './pagination/pagination.parser';
import {
  type ParsedQueryParams,
  parseQueryParams,
  type QueryParamsInput,
} from './query-params';

/**
 * Custom parameter decorator to extract and parse query parameters
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiQueryParams()
 * async findAll(@QueryParams() params: ParsedQueryParams) {
 *   const { top, skip, count, filter, sort } = params;
 *   // Use parsed params in your query
 * }
 * ```
 *
 * The decorator extracts the following query parameters:
 * - $top: Number of items to return (default: 20, max: 100)
 * - $skip: Number of items to skip (default: 0)
 * - $count: Include total count in response (default: false)
 * - $filter: OData-style filter expression
 * - $orderby: Comma-separated list of fields to sort by
 * - $skiptoken: Continuation token for cursor-based pagination
 */
export const QueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ParsedQueryParams => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query;

    const input: QueryParamsInput = {
      top: query.$top ? parseInt(query.$top as string, 10) : undefined,
      skip: query.$skip ? parseInt(query.$skip as string, 10) : undefined,
      count: query.$count ? query.$count === 'true' : undefined,
      skiptoken: query.$skiptoken as string | undefined,
      $filter: query.$filter as string | undefined,
      $orderby: query.$orderby as string | undefined,
    };

    return parseQueryParams(input);
  },
);

/**
 * Swagger documentation decorator for OData-style query parameters
 * Applies all query parameter documentation for list endpoints
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiQueryParams()
 * async findAll(@QueryParams() params: ParsedQueryParams) { ... }
 * ```
 */
export function ApiQueryParams() {
  return applyDecorators(
    ApiQuery({
      name: '$top',
      required: false,
      type: Number,
      description: `Number of items to return. Default: ${QUERY_DEFAULTS.TOP}, Max: ${QUERY_DEFAULTS.MAX_TOP}`,
      example: 20,
    }),
    ApiQuery({
      name: '$skip',
      required: false,
      type: Number,
      description: 'Number of items to skip for pagination. Default: 0',
      example: 0,
    }),
    ApiQuery({
      name: '$count',
      required: false,
      type: Boolean,
      description: 'Include total count in response. Default: false',
      example: false,
    }),
    ApiQuery({
      name: '$filter',
      required: false,
      type: String,
      description: `OData-style filter expression. Supports: eq, ne, gt, ge, lt, le, and, or, not, contains(), startswith(), endswith()`,
      example: "status eq 'active' and createdAt gt 2024-01-01",
    }),
    ApiQuery({
      name: '$orderby',
      required: false,
      type: String,
      description:
        'Comma-separated list of fields to sort by with optional direction (asc/desc)',
      example: 'createdAt desc, name asc',
    }),
    ApiQuery({
      name: '$skiptoken',
      required: false,
      type: String,
      description: 'Continuation token for cursor-based pagination',
    }),
  );
}

/**
 * Swagger documentation decorator for $filter query parameter only
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiFilter()
 * async findAll(@Query('$filter') filter: string) { ... }
 * ```
 */
export function ApiFilter() {
  return applyDecorators(
    ApiQuery({
      name: '$filter',
      required: false,
      type: String,
      description: `OData-style filter expression. Supports: eq, ne, gt, ge, lt, le, and, or, not, contains(), startswith(), endswith()`,
      example: "status eq 'active' and name contains 'test'",
    }),
  );
}

/**
 * Swagger documentation decorator for $orderby query parameter only
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiOrderBy()
 * async findAll(@Query('$orderby') orderby: string) { ... }
 * ```
 */
export function ApiOrderBy() {
  return applyDecorators(
    ApiQuery({
      name: '$orderby',
      required: false,
      type: String,
      description:
        'Comma-separated list of fields to sort by with optional direction (asc/desc)',
      example: 'createdAt desc, name asc',
    }),
  );
}

/**
 * Swagger documentation decorator for pagination query parameters only
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiPagination()
 * async findAll(@Query('$top') top: number, @Query('$skip') skip: number) { ... }
 * ```
 */
export function ApiPagination() {
  return applyDecorators(
    ApiQuery({
      name: '$top',
      required: false,
      type: Number,
      description: `Number of items to return. Default: ${QUERY_DEFAULTS.TOP}, Max: ${QUERY_DEFAULTS.MAX_TOP}`,
      example: 20,
    }),
    ApiQuery({
      name: '$skip',
      required: false,
      type: Number,
      description: 'Number of items to skip for pagination. Default: 0',
      example: 0,
    }),
    ApiQuery({
      name: '$count',
      required: false,
      type: Boolean,
      description: 'Include total count in response. Default: false',
      example: false,
    }),
    ApiQuery({
      name: '$skiptoken',
      required: false,
      type: String,
      description: 'Continuation token for cursor-based pagination',
    }),
  );
}
