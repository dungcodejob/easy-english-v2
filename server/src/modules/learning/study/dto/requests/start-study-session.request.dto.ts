import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum StudyScopeDto {
  DUE = 'DUE',
  TOPIC = 'TOPIC',
}

export enum StudyTypeDto {
  FLASHCARD = 'FLASHCARD',
  QUIZ = 'QUIZ',
}

export class StartStudySessionRequestDto {
  @ApiProperty({ enum: StudyScopeDto, description: 'Study scope type' })
  @IsEnum(StudyScopeDto)
  scope!: StudyScopeDto;

  @ApiPropertyOptional({
    enum: StudyTypeDto,
    description: 'Study mode type (defaults to FLASHCARD)',
    default: StudyTypeDto.FLASHCARD,
  })
  @IsOptional()
  @IsEnum(StudyTypeDto)
  studyType?: StudyTypeDto;

  @ApiPropertyOptional({
    description: 'Required when scope is TOPIC',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  topicId?: string;
}
