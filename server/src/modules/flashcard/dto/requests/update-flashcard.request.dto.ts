import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFlashcardRequestDto {
  @ApiPropertyOptional({ example: 'Hello' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  front?: string;

  @ApiPropertyOptional({ example: 'Xin chào' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  back?: string;

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
}
