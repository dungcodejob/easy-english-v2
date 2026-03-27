import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum StudyScopeDto {
  DUE = 'DUE',
  TOPIC = 'TOPIC',
}

export class StartStudySessionRequestDto {
  @ApiProperty({ enum: StudyScopeDto, description: 'Study scope type' })
  @IsEnum(StudyScopeDto)
  scope!: StudyScopeDto;

  @ApiPropertyOptional({
    description: 'Required when scope is TOPIC',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  topicId?: string;
}
