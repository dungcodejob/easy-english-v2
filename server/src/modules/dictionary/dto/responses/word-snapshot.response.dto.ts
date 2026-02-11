import { ApiProperty } from '@nestjs/swagger';
import { WordSnapshot } from '../../domain/value-objects/word-snapshot.vo';

export class PronunciationDto {
  @ApiProperty({ example: '/həˈloʊ/' })
  ipa!: string;

  @ApiProperty({
    example: 'https://cdn.example.com/audio/hello.mp3',
    nullable: true,
  })
  audioUrl!: string | null;

  @ApiProperty({ example: 'US' })
  region!: string;
}

export class ExampleDto {
  @ApiProperty({ example: 'Hello, how are you?' })
  text!: string;

  @ApiProperty({ example: 'Xin chào, bạn khỏe không?', nullable: true })
  translationVi!: string | null;

  @ApiProperty({ example: 1 })
  order!: number;
}

export class WordFamilyDto {
  @ApiProperty({ type: [String], required: false })
  n?: string[];

  @ApiProperty({ type: [String], required: false })
  adj?: string[];

  @ApiProperty({ type: [String], required: false })
  adv?: string[];

  @ApiProperty({ type: [String], required: false })
  v?: string[];

  @ApiProperty()
  head!: string;
}

export class CollocationDto {
  @ApiProperty({ required: false })
  pre?: {
    v?: string[];
    adv?: string[];
  };

  @ApiProperty({ required: false })
  suf?: {
    prep?: string[];
  };
}

export class SenseDto {
  @ApiProperty({ example: 'interjection' })
  partOfSpeech!: string;

  @ApiProperty({
    example: 'Used as a greeting or to begin a phone conversation.',
  })
  definition!: string;

  @ApiProperty({ example: 'A greeting', nullable: true })
  shortDefinition!: string | null;

  @ApiProperty({ example: 'A1', nullable: true })
  cefrLevel!: string | null;

  @ApiProperty({ type: [ExampleDto] })
  examples!: ExampleDto[];

  @ApiProperty({ type: [String], example: ['hi', 'hey'] })
  synonyms!: string[];

  @ApiProperty({ type: [String], example: ['goodbye'] })
  antonyms!: string[];

  @ApiProperty({ example: 'Dùng để chào hỏi.', nullable: true })
  definitionVi!: string | null;

  @ApiProperty({ type: [String], required: false })
  idioms?: string[];

  @ApiProperty({ type: [String], required: false })
  phrases?: string[];

  @ApiProperty({ type: [String], required: false })
  verbPhrases?: string[];

  @ApiProperty({ type: [String], required: false })
  images?: string[];

  @ApiProperty({ type: CollocationDto, required: false })
  collocations?: CollocationDto;
}

export class WordSnapshotResponseDto {
  @ApiProperty({ example: 'hello' })
  text!: string;

  @ApiProperty({ example: 'hello' })
  normalizedText!: string;

  @ApiProperty({ example: 'en' })
  language!: string;

  @ApiProperty({ example: 'internal', enum: ['internal', 'azvocab'] })
  source!: 'internal' | 'azvocab';

  @ApiProperty({ example: 150, nullable: true })
  rank!: number | null;

  @ApiProperty({ example: 0.95, nullable: true })
  frequency!: number | null;

  @ApiProperty({ type: [PronunciationDto] })
  pronunciations!: PronunciationDto[];

  @ApiProperty({ type: [SenseDto] })
  senses!: SenseDto[];

  @ApiProperty({ required: false })
  inflects?: Record<string, string[]>;

  @ApiProperty({ type: WordFamilyDto, required: false })
  wordFamily?: WordFamilyDto;

  constructor(snapshot: WordSnapshot) {
    this.text = snapshot.text;
    this.normalizedText = snapshot.normalizedText;
    this.language = snapshot.language;
    this.source = snapshot.source;
    this.rank = snapshot.rank;
    this.frequency = snapshot.frequency;
    this.pronunciations = snapshot.pronunciations.map((p) => ({
      ipa: p.ipa,
      audioUrl: p.audioUrl,
      region: p.region,
    }));
    this.senses = snapshot.senses.map((s) => ({
      partOfSpeech: s.partOfSpeech,
      definition: s.definition,
      shortDefinition: s.shortDefinition,
      cefrLevel: s.cefrLevel,
      synonyms: s.synonyms,
      antonyms: s.antonyms,
      definitionVi: s.definitionVi,
      examples: s.examples.map((e) => ({
        text: e.text,
        translationVi: e.translationVi,
        order: e.order,
      })),
      idioms: s.idioms,
      phrases: s.phrases,
      verbPhrases: s.verbPhrases,
      images: s.images,
      collocations: s.collocations,
    }));
    this.inflects = snapshot.inflects;
    this.wordFamily = snapshot.wordFamily;
  }
}
