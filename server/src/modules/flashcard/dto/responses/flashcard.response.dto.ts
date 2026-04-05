import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FlashcardResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  front!: string;

  @ApiProperty()
  back!: string;

  @ApiPropertyOptional()
  hint?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ enum: ['dictionary', 'custom'] })
  source!: 'dictionary' | 'custom';

  @ApiPropertyOptional()
  wordSenseId?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  state!: string;

  @ApiProperty()
  dueDate!: string;
}
