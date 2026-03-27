import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';

export enum ReviewRatingDto {
  AGAIN = 1,
  HARD = 2,
  GOOD = 3,
  EASY = 4,
}

export class StudySessionReviewRequestDto {
  @ApiProperty({ format: 'uuid', description: 'Active study session UUID' })
  @IsUUID()
  sessionId!: string;

  @ApiProperty({ format: 'uuid', description: 'Word sense UUID' })
  @IsUUID()
  wordSenseId!: string;

  @ApiProperty({ enum: ReviewRatingDto, description: 'FSRS rating (1–4)' })
  @IsEnum(ReviewRatingDto)
  rating!: ReviewRatingDto;

  @ApiProperty({
    description: 'Time spent on this review in milliseconds',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  reviewDurationMs!: number;
}
