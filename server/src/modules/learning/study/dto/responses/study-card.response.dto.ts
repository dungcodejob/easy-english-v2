import { ApiProperty } from '@nestjs/swagger';

export class StudyCardBackDto {
  @ApiProperty({ description: 'Primary dictionary definition' })
  definition!: string;

  @ApiProperty({
    description: 'First example sentence if available',
    nullable: true,
  })
  example!: string | null;
}

export class StudyCardResponseDto {
  @ApiProperty({ format: 'uuid' })
  wordSenseId!: string;

  @ApiProperty({ description: 'Card front text (headword + POS)' })
  front!: string;

  @ApiProperty({ type: StudyCardBackDto })
  back!: StudyCardBackDto;

  @ApiProperty({ description: 'Card hint text' })
  hint!: string;

  @ApiProperty({
    description: 'Current due date used by retrieval endpoints',
    nullable: true,
  })
  dueDate!: string | null;

  @ApiProperty({ description: 'Whether card is currently due' })
  isDue!: boolean;

  @ApiProperty({ description: 'Whether card is currently considered mastered' })
  isMastered!: boolean;

  @ApiProperty({
    description: 'Derived mastery level from existing progress mapping',
    minimum: 0,
    maximum: 5,
  })
  masteryLevel!: 0 | 1 | 2 | 3 | 4 | 5;
}

export class StudyCardsEnvelopeDto {
  @ApiProperty({ type: [StudyCardResponseDto] })
  cards!: StudyCardResponseDto[];

  @ApiProperty({
    description:
      'Count after malformed-card exclusion and deduplication, before 100-card cap',
  })
  total!: number;

  @ApiProperty({
    description: 'True when 100-card phase-1 cap truncated the returned cards',
  })
  capped!: boolean;
}

export class TopicStudyCardsEnvelopeDto extends StudyCardsEnvelopeDto {
  @ApiProperty({ format: 'uuid' })
  topicId!: string;
}
