import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { parsePagination, QUERY_DEFAULTS } from './pagination.parser';

/**
 * Parsed pagination result for use in controller methods
 */
export interface ParsedPaginationParams {
  /** Number of items to return */
  top: number;
  /** Number of items to skip */
  skip: number;
  /** Include total count in response */
  count: boolean;
  /** Continuation token for cursor-based pagination */
  skiptoken?: string;
}

/**
 * Parameter decorator to extract and parse pagination query parameters
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiPaginationParams()
 * async findAll(@PaginationParam() params: PaginationParams) {
 *   const { top, skip, count, skiptoken } = params;
 *   // Use pagination params in your query
 * }
 * ```
 */
export const PaginationParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ParsedPaginationParams => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query;

    const input = {
      top: query['$top'] ? parseInt(query['$top'] as string, 10) : undefined,
      skip: query['$skip'] ? parseInt(query['$skip'] as string, 10) : undefined,
      count: query['$count'] ? query['$count'] === 'true' : undefined,
      skiptoken: query['$skiptoken'] as string | undefined,
    };

    const { top, skip, count } = parsePagination(input);

    return {
      top,
      skip,
      count,
      skiptoken: input.skiptoken,
    };
  },
);

/**
 * Swagger documentation decorator for pagination query parameters
 *
 * Usage:
 * ```typescript
 * @Get()
 * @ApiPaginationParams()
 * async findAll(@PaginationParam() params: PaginationParams) { ... }
 * ```
 */
export function ApiPaginationParams() {
  return applyDecorators(
    ApiQuery({
      name: '$top',
      required: false,
      type: Number,
      description: `Number of items to return. Min: ${QUERY_DEFAULTS.MIN_TOP}, Max: ${QUERY_DEFAULTS.MAX_TOP}, Default: ${QUERY_DEFAULTS.TOP}`,
      example: 20,
    }),
    ApiQuery({
      name: '$skip',
      required: false,
      type: Number,
      description:
        'Number of items to skip for offset-based pagination. Default: 0',
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
      description:
        'Continuation token for cursor-based pagination. Use this instead of $skip for large datasets.',
    }),
  );
}
