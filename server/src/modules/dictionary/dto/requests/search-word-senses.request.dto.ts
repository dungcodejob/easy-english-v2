import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SearchWordSensesRequestDto {
  @ApiProperty({
    description: 'Search term (min 1 char, max 100)',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : (value as unknown),
  )
  @MinLength(1)
  @MaxLength(100)
  readonly q!: string;

  @ApiPropertyOptional({
    name: '$top',
    description: 'Page size (default 20, max 50)',
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  readonly $top?: number = 20;

  @ApiPropertyOptional({
    name: '$skip',
    description: 'Offset',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly $skip?: number = 0;
}
