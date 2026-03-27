import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  CollocationDto,
  ExampleDto,
  PronunciationDto,
} from './word.response.dto';

export class LearningStateDto {
  @ApiProperty({
    description: 'Whether the user is currently learning this word sense',
  })
  readonly isLearning!: boolean;

  @ApiProperty({ description: 'Current mastery level (0-5)' })
  readonly masteryLevel!: number;

  @ApiProperty({ description: 'Number of times reviewed' })
  readonly reviewCount!: number;

  @ApiProperty({ description: 'Next scheduled review time' })
  readonly nextReviewAt!: Date;
}

export class WordSenseDetailResponseDto {
  @ApiProperty({ description: 'The unique identifier of the WordSense' })
  readonly senseId!: string;

  @ApiProperty({ description: 'The text of the word' })
  readonly wordText!: string;

  @ApiProperty({ description: 'The normalized text of the word' })
  readonly normalizedText!: string;

  @ApiProperty({ description: 'Part of speech' })
  readonly partOfSpeech!: string;

  @ApiProperty({ description: 'Full english definition' })
  readonly definition!: string;

  @ApiPropertyOptional({ description: 'Short definition' })
  readonly shortDefinition!: string | null;

  @ApiPropertyOptional({ description: 'CEFR level' })
  readonly cefrLevel!: string | null;

  @ApiPropertyOptional({
    description: 'Vietnamese translation of the definition',
  })
  readonly definitionVi!: string | null;

  @ApiProperty({ type: [ExampleDto], description: 'Examples of usage' })
  readonly examples!: ExampleDto[];

  @ApiProperty({ type: [String], description: 'Synonyms' })
  readonly synonyms!: string[];

  @ApiProperty({ type: [String], description: 'Antonyms' })
  readonly antonyms!: string[];

  @ApiProperty({
    type: [String],
    description: 'Idioms containing the word sense',
  })
  readonly idioms!: string[];

  @ApiProperty({
    type: [String],
    description: 'Phrases containing the word sense',
  })
  readonly phrases!: string[];

  @ApiPropertyOptional({ description: 'Collocations (JSON object)' })
  readonly collocations!: CollocationDto | null;

  @ApiProperty({
    type: [PronunciationDto],
    description: 'Pronunciations including audio',
  })
  readonly pronunciations!: PronunciationDto[];
}
