import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DueCardResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  front!: string;

  @ApiProperty()
  back!: string;

  @ApiPropertyOptional()
  hint?: string;

  @ApiProperty({ enum: ['dictionary', 'custom'] })
  source!: 'dictionary' | 'custom';

  @ApiProperty()
  state!: string;

  @ApiProperty()
  dueDate!: string;
}
