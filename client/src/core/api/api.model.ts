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

/**
 * Custom error class for API errors that follow the envelope format.
 * This allows structured error handling with access to error code, type, and field-level details.
 */
export class ApiRequestError extends Error {
  public readonly code: string;
  public readonly type: ErrorType;
  public readonly details?: ErrorDetail[];
  public readonly correlationId: string;

  constructor(error: ApiError, correlationId: string) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.code = error.code;
    this.type = error.type;
    this.details = error.details;
    this.correlationId = correlationId;

    // Maintains proper stack trace for where error was thrown (V8 engines)
    const ErrorWithCapture = Error as typeof Error & {
      captureStackTrace?: (target: object, constructor: unknown) => void;
    };
    if (ErrorWithCapture.captureStackTrace) {
      ErrorWithCapture.captureStackTrace(this, ApiRequestError);
    }
  }

  /**
   * Get field-specific error message
   */
  getFieldError(field: string): string | undefined {
    return this.details?.find((d) => d.field === field)?.message;
  }

  /**
   * Check if this is a validation/client error
   */
  isClientError(): boolean {
    return this.type === ErrorType.CLIENT;
  }

  /**
   * Check if this is a domain/business logic error
   */
  isDomainError(): boolean {
    return this.type === ErrorType.DOMAIN;
  }

  /**
   * Check if this is a system/server error
   */
  isSystemError(): boolean {
    return this.type === ErrorType.SYSTEM;
  }
}
