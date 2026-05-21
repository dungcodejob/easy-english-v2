import { ApiProperty } from '@nestjs/swagger';

import { ErrorType } from '../response.types';

export class PaginationDto {
  @ApiProperty({ description: 'Number of items to return' })
  top: number;

  @ApiProperty({ description: 'Total number of items', required: false })
  count?: number;

  @ApiProperty({ description: 'Whether there are more items' })
  hasMore: boolean;

  @ApiProperty({ description: 'Number of items to skip', required: false })
  skip?: number;

  @ApiProperty({ description: 'Link to the next page', required: false })
  nextLink?: string;
}

export class ErrorDetailDto {
  @ApiProperty()
  field: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  code?: string;
}

export class ApiErrorDto {
  @ApiProperty()
  code: string;

  @ApiProperty({ enum: ErrorType, example: ErrorType.CLIENT })
  type: ErrorType;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: () => ErrorDetailDto, isArray: true, required: false })
  details?: ErrorDetailDto[];
}

export class ApiSuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ nullable: true })
  data: T | null;

  @ApiProperty({ required: false })
  meta?: Record<string, unknown>;

  @ApiProperty({ required: false, type: PaginationDto })
  pagination?: PaginationDto;

  @ApiProperty({
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  correlationId?: string;

  @ApiProperty({ required: false, example: '2024-01-01T00:00:00.000Z' })
  timestamp?: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ type: ApiErrorDto })
  error: ApiErrorDto;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  correlationId: string;

  @ApiProperty({ required: false, example: '2024-01-01T00:00:00.000Z' })
  timestamp?: string;
}
