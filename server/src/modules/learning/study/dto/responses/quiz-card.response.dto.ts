import { ApiProperty } from '@nestjs/swagger';

export class QuizOptionDto {
  @ApiProperty({ enum: ['A', 'B', 'C', 'D'] })
  label!: 'A' | 'B' | 'C' | 'D';

  @ApiProperty({ example: 'everywhere — present or found everywhere' })
  text!: string;
}

export class QuizCardDto {
  @ApiProperty({ format: 'uuid' })
  wordSenseId!: string;

  @ApiProperty({ example: 'ubiquitous' })
  word!: string;

  @ApiProperty({ example: 'adjective' })
  partOfSpeech!: string;

  @ApiProperty({ example: 'ubiquitous' })
  question!: string;

  @ApiProperty({ type: [QuizOptionDto] })
  options!: QuizOptionDto[];

  @ApiProperty({ enum: ['A', 'B', 'C', 'D'] })
  correctAnswer!: 'A' | 'B' | 'C' | 'D';
}
