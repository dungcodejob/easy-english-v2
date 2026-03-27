import { ApiProperty } from '@nestjs/swagger';
import {
  studySessionScope,
  studySessionStatus,
  studySessionType,
  type StudySessionScope,
  type StudySessionStatus,
  type StudySessionType,
} from '../../domain/entities/study-session.entity';

export class RatingBreakdownDto {
  @ApiProperty({ description: 'Number of Again (1) reviews' })
  again!: number;

  @ApiProperty({ description: 'Number of Hard (2) reviews' })
  hard!: number;

  @ApiProperty({ description: 'Number of Good (3) reviews' })
  good!: number;

  @ApiProperty({ description: 'Number of Easy (4) reviews' })
  easy!: number;
}

export class SessionSummaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  sessionId!: string;

  @ApiProperty({ enum: studySessionScope })
  scope!: StudySessionScope;

  @ApiProperty({ enum: studySessionType })
  studyType!: StudySessionType;

  @ApiProperty({ format: 'uuid', nullable: true })
  topicId!: string | null;

  @ApiProperty({ enum: studySessionStatus })
  status!: StudySessionStatus;

  @ApiProperty({ description: 'Total number of reviews in this session' })
  reviewedCount!: number;

  @ApiProperty({ description: 'Total enrolled cards at session start' })
  enrolledCount!: number;

  @ApiProperty({ type: RatingBreakdownDto })
  ratingBreakdown!: RatingBreakdownDto;

  @ApiProperty({
    description: 'Percentage of Good+Easy reviews, rounded to 1 decimal',
    example: 78.3,
  })
  accuracy!: number;

  @ApiProperty({
    description: 'Total time spent reviewing in milliseconds',
  })
  timeSpentMs!: number;

  @ApiProperty({ format: 'date-time' })
  startedAt!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  completedAt!: string | null;
}
