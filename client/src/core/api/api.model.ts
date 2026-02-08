export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T | null;
  readonly meta?: Record<string, unknown>;
  readonly pagination?: {
    top: number;
    count?: number;
    hasMore: boolean;
    skip?: number;
    nextLink?: string;
  };
  readonly correlationId?: string;
  readonly timestamp?: string;
}

export enum ErrorType {
  CLIENT = 'client',
  DOMAIN = 'domain',
  SYSTEM = 'system',
}

export interface ErrorDetail {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}

export interface ApiError {
  readonly code: string;
  readonly type: ErrorType;
  readonly message: string;
  readonly details?: ErrorDetail[];
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: ApiError;
  readonly correlationId: string;
  readonly timestamp?: string;
}

export type ApiResponseEnvelope<T> = ApiSuccessResponse<T> | ApiErrorResponse;
