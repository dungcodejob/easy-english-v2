import { randomUUID } from 'node:crypto';

import { type PaginationParams } from './pagination/pagination.types';
import {
  type ApiErrorResponse,
  type ApiSuccessResponse,
  type ErrorDetail,
  ErrorType,
} from './response.types';

export class ApiResponse {
  static success<T>(
    data: T | null,
    options?: {
      meta?: Record<string, unknown>;
      correlationId?: string;
    },
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      meta: options?.meta,
      correlationId: options?.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationParams,
    options?: {
      meta?: Record<string, unknown>;
      correlationId?: string;
    },
  ): ApiSuccessResponse<T[]> {
    return {
      success: true,
      data,
      pagination,
      meta: options?.meta,
      correlationId: options?.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    code: string,
    message: string,
    type: ErrorType = ErrorType.CLIENT,
    options?: {
      details?: ErrorDetail[];
      correlationId?: string;
    },
  ): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        type,
        message,
        details: options?.details,
      },
      correlationId: options?.correlationId || randomUUID(),
      timestamp: new Date().toISOString(),
    };
  }
}
