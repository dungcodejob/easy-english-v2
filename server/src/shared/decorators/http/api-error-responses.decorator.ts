import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import {
  ApiErrorDto,
  ApiErrorResponseDto,
} from '../../../core/api/dto/api-response.dto';
import { ErrorType } from '../../../core/api/response.types';

/**
 * Error Response Interface
 */
export interface ErrorResponseConfig {
  status: number;
  description: string;
  example?: unknown;
}

/**
 * Common Error Examples
 */
export const validationErrorExample = {
  success: false,
  error: {
    code: 'Validation.Failed',
    type: ErrorType.CLIENT,
    message: 'Validation failed',
    details: [
      {
        field: 'email',
        message: 'Email must be a valid email address',
      },
      {
        field: 'password',
        message: 'Password must be at least 8 characters long',
      },
    ],
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  correlationId: '123e4567-e89b-12d3-a456-426614174000',
};

export const unauthorizedExample = {
  success: false,
  error: {
    code: 'Auth.Unauthorized',
    type: ErrorType.CLIENT,
    message: 'Unauthorized',
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  correlationId: '123e4567-e89b-12d3-a456-426614174000',
};

export const forbiddenExample = {
  success: false,
  error: {
    code: 'Auth.Forbidden',
    type: ErrorType.CLIENT,
    message: 'Forbidden - Insufficient permissions',
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  correlationId: '123e4567-e89b-12d3-a456-426614174000',
};

export const notFoundExample = {
  success: false,
  error: {
    code: 'Resource.NotFound',
    type: ErrorType.CLIENT,
    message: 'Resource not found',
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  correlationId: '123e4567-e89b-12d3-a456-426614174000',
};

export const rateLimitExample = {
  success: false,
  error: {
    code: 'RateLimit.Exceeded',
    type: ErrorType.CLIENT,
    message: 'Too many requests. Please try again later.',
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  correlationId: '123e4567-e89b-12d3-a456-426614174000',
};

export const internalServerErrorExample = {
  success: false,
  error: {
    code: 'App.InternalServerError',
    type: ErrorType.SYSTEM,
    message: 'Internal server error',
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  correlationId: '123e4567-e89b-12d3-a456-426614174000',
};

export const conflictExample = {
  success: false,
  error: {
    code: 'Resource.Conflict',
    type: ErrorType.CLIENT,
    message: 'Resource already exists',
    details: [
      {
        field: 'email',
        message: 'Email already exists',
      },
    ],
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  correlationId: '123e4567-e89b-12d3-a456-426614174000',
};

export const unprocessableEntityExample = {
  success: false,
  error: {
    code: 'Validation.UnprocessableEntity',
    type: ErrorType.CLIENT,
    message: 'The request was well-formed but contains semantic errors',
    details: [
      {
        field: 'url',
        message: 'URL is not accessible',
      },
    ],
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  correlationId: '123e4567-e89b-12d3-a456-426614174000',
};

/**
 * Predefined Error Response Sets
 */
export const COMMON_ERROR_RESPONSES: ErrorResponseConfig[] = [
  {
    status: 400,
    description: 'Validation Error',
    example: validationErrorExample,
  },
  { status: 401, description: 'Unauthorized', example: unauthorizedExample },
  {
    status: 500,
    description: 'Internal Server Error',
    example: internalServerErrorExample,
  },
];

export const AUTH_ERROR_RESPONSES: ErrorResponseConfig[] = [
  {
    status: 400,
    description: 'Validation Error',
    example: validationErrorExample,
  },
  { status: 401, description: 'Unauthorized', example: unauthorizedExample },
  { status: 429, description: 'Rate Limited', example: rateLimitExample },
  {
    status: 500,
    description: 'Internal Server Error',
    example: internalServerErrorExample,
  },
];

export const CRUD_ERROR_RESPONSES: ErrorResponseConfig[] = [
  {
    status: 400,
    description: 'Validation Error',
    example: validationErrorExample,
  },
  { status: 401, description: 'Unauthorized', example: unauthorizedExample },
  { status: 403, description: 'Forbidden', example: forbiddenExample },
  { status: 404, description: 'Not Found', example: notFoundExample },
  { status: 409, description: 'Conflict', example: conflictExample },
  {
    status: 422,
    description: 'Unprocessable Entity',
    example: unprocessableEntityExample,
  },
  {
    status: 500,
    description: 'Internal Server Error',
    example: internalServerErrorExample,
  },
];

/**
 * Custom API Error Responses Decorator
 *
 * @param errorConfigs Array of error response configurations
 * @returns Combined decorators for all error responses
 */
export const ApiErrorResponses = (errorConfigs: ErrorResponseConfig[]) => {
  const decorators = [
    ApiExtraModels(ApiErrorResponseDto, ApiErrorDto),
    ...errorConfigs.map((config) =>
      ApiResponse({
        status: config.status,
        description: config.description,
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiErrorResponseDto) },
            {
              example: config.example,
            },
          ],
        },
      }),
    ),
  ];

  return applyDecorators(...decorators);
};

/**
 * Shorthand decorators for common error response sets
 */
export const ApiCommonErrors = () => ApiErrorResponses(COMMON_ERROR_RESPONSES);
export const ApiAuthErrors = () => ApiErrorResponses(AUTH_ERROR_RESPONSES);
export const ApiCrudErrors = () => ApiErrorResponses(CRUD_ERROR_RESPONSES);
