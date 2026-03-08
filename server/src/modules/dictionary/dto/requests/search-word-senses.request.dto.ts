import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

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
}
