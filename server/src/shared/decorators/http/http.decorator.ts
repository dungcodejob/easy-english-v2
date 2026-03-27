import { STATUS_CODES } from 'http';

import {
  applyDecorators,
  HttpCode,
  HttpStatus,
  type Type,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  getSchemaPath,
} from '@nestjs/swagger';

import { ApiPaginationParams } from '@core/api';

import { SWAGGER_SCHEME } from '@shared/constants';

import {
  ApiSuccessResponseDto,
  PaginationDto,
} from '../../../core/api/dto/api-response.dto';
import { Public } from '../public.decorator';
import {
  ApiErrorResponses,
  type ErrorResponseConfig,
} from './api-error-responses.decorator';

type ErrorResponseStatus = number;
type ApiAuthType = 'basic' | 'api-key' | 'jwt';
type PaginationType = 'offset' | 'cursor';
type ResponseType = 'single' | 'list' | 'pagination';

interface IApiOptions<T extends Type<unknown>> {
  type?: T;
  bodyType?: Type<unknown>;
  summary?: string;
  description?: string;
  errorResponses?: ErrorResponseStatus[];
  statusCode?: HttpStatus;
  responseType?: ResponseType;
  paginationType?: PaginationType;
}

type IApiPublicOptions = IApiOptions<Type<unknown>>;

interface IApiAuthOptions extends IApiOptions<Type<unknown>> {
  auths?: ApiAuthType[];
}

export const ApiPublic = (options: IApiPublicOptions = {}): MethodDecorator => {
  const defaultStatusCode = HttpStatus.OK;
  const defaultErrorResponses = [
    HttpStatus.BAD_REQUEST,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
    HttpStatus.UNPROCESSABLE_ENTITY,
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];

  const errorResponses = (options.errorResponses || defaultErrorResponses)?.map(
    (statusCode) =>
      ({
        status: statusCode,
        description: STATUS_CODES[statusCode],
      }) as ErrorResponseConfig,
  );

  const decorators = [
    Public(),
    ApiErrorResponses(errorResponses),
    ApiOperation({ summary: options?.summary }),
    HttpCode(options.statusCode || defaultStatusCode),
  ];

  if (options.bodyType) {
    decorators.push(ApiBody({ type: options.bodyType }));
  }

  if (options.type) {
    switch (options.responseType) {
      case 'pagination': {
        decorators.push(
          ApiPaginationParams(),
          ApiOkResponsePagination({
            itemType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
      case 'list': {
        decorators.push(
          ApiOkResponseList({
            itemType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
      case 'single': {
        decorators.push(
          ApiOkResponseSingle({
            dataType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
    }
  }

  return applyDecorators(...decorators);
};

export const ApiAuth = (options: IApiAuthOptions = {}): MethodDecorator => {
  const defaultStatusCode = HttpStatus.OK;
  const defaultErrorResponses = [
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
    HttpStatus.UNPROCESSABLE_ENTITY,
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];

  const auths = options.auths || ['jwt'];

  const errorResponses = (options.errorResponses || defaultErrorResponses)?.map(
    (statusCode) =>
      ({
        status: statusCode,
        description: STATUS_CODES[statusCode],
      }) as ErrorResponseConfig,
  );

  const authDecorators = auths.map((auth) => {
    switch (auth) {
      case 'basic':
        return ApiBasicAuth(SWAGGER_SCHEME.BASIC_AUTH);
      case 'api-key':
        return ApiSecurity(SWAGGER_SCHEME.API_KEY);
      case 'jwt':
        return ApiBearerAuth(SWAGGER_SCHEME.JWT_AUTH);
    }
  });

  const decorators = [
    ...authDecorators,
    ApiErrorResponses(errorResponses),
    ApiOperation({ summary: options?.summary }),
    HttpCode(options.statusCode || defaultStatusCode),
  ];

  if (options.bodyType) {
    decorators.push(ApiBody({ type: options.bodyType }));
  }

  const responseType = options.responseType || 'single';

  if (options.type) {
    switch (responseType) {
      case 'pagination': {
        decorators.push(
          ApiOkResponsePagination({
            itemType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
      case 'list': {
        decorators.push(
          ApiOkResponseList({
            itemType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
      case 'single': {
        decorators.push(
          ApiOkResponseSingle({
            dataType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
    }
  } else {
    decorators.push(
      ApiOkResponseSingle({ description: options?.description ?? 'OK' }),
    );
  }

  return applyDecorators(...decorators);
};

/**
 * Generic Single Response Decorator
 */
export const ApiOkResponseSingle = <
  GenericType extends Type<unknown>,
>(options: {
  dataType?: GenericType;
  description: string;
}) => {
  const {
    dataType,
    description = `Successful response with ${dataType?.name} data`,
  } = options;

  if (dataType) {
    return applyDecorators(
      ApiExtraModels(ApiSuccessResponseDto, dataType),
      ApiOkResponse({
        description,
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiSuccessResponseDto) },
            {
              properties: {
                data: { $ref: getSchemaPath(dataType) },
              },
            },
          ],
        },
      }),
    );
  }

  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          {
            properties: {
              data: { nullable: true },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Generic List Response Decorator
 */
export const ApiOkResponseList = <GenericType extends Type<unknown>>(options: {
  itemType: GenericType;
  description: string;
}) => {
  const {
    itemType,
    description = `Successful list response with ${itemType.name} items`,
  } = options;

  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, itemType),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(itemType) },
              },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Generic Pagination Response Decorator
 */
export const ApiOkResponsePagination = <
  GenericType extends Type<unknown>,
>(options: {
  itemType: GenericType;
  description: string;
}) => {
  const {
    itemType,
    description = `Successful paginated response with ${itemType.name} items`,
  } = options;

  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, itemType, PaginationDto),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(itemType) },
              },
              pagination: { $ref: getSchemaPath(PaginationDto) },
            },
          },
        ],
      },
    }),
  );
};

// Legacy factory functions for backward compatibility
export const createSwaggerResponseDto = <T>(dataType: Type<T>) =>
  ApiOkResponseSingle({ dataType, description: '' });
export const createSwaggerListResponseDto = <T>(itemType: Type<T>) =>
  ApiOkResponseList({ itemType, description: '' });
export const createSwaggerPaginationResponseDto = <T>(itemType: Type<T>) =>
  ApiOkResponsePagination({ itemType, description: '' });
