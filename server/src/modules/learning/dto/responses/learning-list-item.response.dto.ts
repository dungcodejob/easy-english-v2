import { ApiProperty } from '@nestjs/swagger';

export class LearningListItemResponseDto {
  @ApiProperty({ description: 'Learning record ID' })
  id!: string;

  @ApiProperty({ description: 'Word sense ID' })
  senseId!: string;

  @ApiProperty({ description: 'The text of the word' })
  wordText!: string;

  @ApiProperty({ description: 'Definition of the sense' })
  definition!: string;

  @ApiProperty({ description: 'Short definition' })
  shortDefinition!: string | null;

  @ApiProperty({ description: 'Part of speech' })
  partOfSpeech!: string;

  @ApiProperty({ description: 'Vietnamese translation of definition' })
  definitionVi!: string | null;

  @ApiProperty({ description: 'List of pronunciations', type: [Object] })
  pronunciations!: any[]; // Using any for simplicity in list view, or map properly

  @ApiProperty({ description: 'Mastery level from 0 to 5' })
  masteryLevel!: number;

  @ApiProperty({ description: 'Number of times reviewed' })
  reviewCount!: number;

  @ApiProperty({ description: 'Next scheduled review time', required: false })
  nextReviewAt!: Date | null;

  @ApiProperty({ description: 'Last reviewed time', required: false })
  lastReviewedAt!: Date | null;

  @ApiProperty({ description: 'Date added to learning list' })
  createdAt!: Date;

  @ApiProperty({ description: 'Currently learning' })
  isLearning!: boolean;
}
