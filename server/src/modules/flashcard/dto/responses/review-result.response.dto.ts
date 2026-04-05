import { ApiProperty } from '@nestjs/swagger';

export class ReviewResultResponseDto {
  @ApiProperty()
  cardId!: string;

  @ApiProperty()
  newState!: string;

  @ApiProperty()
  nextDueDate!: string;

  @ApiProperty()
  intervalDays!: number;

  @ApiProperty()
  isMastered!: boolean;
}
