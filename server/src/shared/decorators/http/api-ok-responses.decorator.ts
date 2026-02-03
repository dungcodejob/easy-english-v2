import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ApiSuccessResponseDto,
  PaginationDto,
} from '../../../core/api/dto/api-response.dto';

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
