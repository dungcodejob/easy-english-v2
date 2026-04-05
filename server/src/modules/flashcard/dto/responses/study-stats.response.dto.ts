import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudyStatsResponseDto {
  @ApiProperty()
  streak!: number;

  @ApiProperty()
  totalCardsReviewed!: number;

  @ApiProperty()
  totalStudyTimeMinutes!: number;

  @ApiProperty()
  masteredCards!: number;

  @ApiPropertyOptional()
  lastStudyDate?: string;
}
