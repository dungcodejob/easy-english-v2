import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WordSenseSearchResultResponseDto {
  @ApiProperty({ description: 'The unique identifier of the WordSense' })
  readonly senseId!: string;

  @ApiProperty({ description: 'The text of the word' })
  readonly wordText!: string;

  @ApiProperty({ description: 'The normalized text of the word for search' })
  readonly normalizedText!: string;

  @ApiProperty({ description: 'Part of speech (e.g., noun, verb)' })
  readonly partOfSpeech!: string;

  @ApiPropertyOptional({ description: 'Short definition' })
  readonly shortDefinition!: string | null;

  @ApiPropertyOptional({ description: 'CEFR level (A1, A2, B1, B2, C1, C2)' })
  readonly cefrLevel!: string | null;
}
