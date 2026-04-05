import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFlashcardRequestDto {
  @ApiProperty({ example: 'Hello' })
  @IsString()
  @MaxLength(500)
  front!: string;

  @ApiProperty({ example: 'Xin chào' })
  @IsString()
  @MaxLength(1000)
  back!: string;

  @ApiPropertyOptional({ example: 'Greeting' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  hint?: string;

  @ApiPropertyOptional({ example: 'Common greeting' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ enum: ['dictionary', 'custom'] })
  @IsEnum(['dictionary', 'custom'])
  source!: 'dictionary' | 'custom';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wordSenseId?: string;
}
