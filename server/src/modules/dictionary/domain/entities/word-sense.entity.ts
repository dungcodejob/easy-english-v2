import { v7 } from 'uuid';

import { Entity } from '@core/ddd';

import { type CefrLevel } from '../value-objects/cefr-level.vo';
import { type PartOfSpeech } from '../value-objects/part-of-speech.vo';
import { type WordExampleVO } from '../value-objects/word-example.vo';

export interface WordSenseProps {
  partOfSpeech: PartOfSpeech;
  definition: string;
  shortDefinition: string | null;
  cefrLevel: CefrLevel | null;
  examples: WordExampleVO[];
  synonyms: string[];
  antonyms: string[];
  definitionVi: string | null;
  collocations?: Collocation;
  idioms?: string[];
  phrases?: string[];
  verbPhrases?: string[];
  images?: string[];
}

export interface Collocation {
  pre?: {
    v?: string[];
    adv?: string[];
  };
  suf?: {
    prep?: string[];
  };
}

export class WordSenseEntity extends Entity {
  private _partOfSpeech: PartOfSpeech;
  private _definition: string;
  private _shortDefinition: string | null;
  private _cefrLevel: CefrLevel | null;
  private _examples: WordExampleVO[];
  private _synonyms: string[];
  private _antonyms: string[];
  private _definitionVi: string | null;
  private _collocations?: Collocation;
  private _idioms?: string[];
  private _phrases?: string[];
  private _verbPhrases?: string[];
  private _images?: string[];

  constructor(
    props: { id: string; createdAt?: Date; updatedAt?: Date } & WordSenseProps,
  ) {
    super({
      id: props.id,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
    this._partOfSpeech = props.partOfSpeech;
    this._definition = props.definition;
    this._shortDefinition = props.shortDefinition;
    this._cefrLevel = props.cefrLevel;
    this._examples = props.examples;
    this._synonyms = props.synonyms;
    this._antonyms = props.antonyms;
    this._definitionVi = props.definitionVi;
    this._collocations = props.collocations;
    this._idioms = props.idioms;
    this._phrases = props.phrases;
    this._verbPhrases = props.verbPhrases;
    this._images = props.images;
  }

  get partOfSpeech(): PartOfSpeech {
    return this._partOfSpeech;
  }

  get definition(): string {
    return this._definition;
  }

  get shortDefinition(): string | null {
    return this._shortDefinition;
  }

  get cefrLevel(): CefrLevel | null {
    return this._cefrLevel;
  }

  get examples(): WordExampleVO[] {
    return this._examples;
  }

  get synonyms(): string[] {
    return this._synonyms;
  }

  get antonyms(): string[] {
    return this._antonyms;
  }

  get definitionVi(): string | null {
    return this._definitionVi;
  }

  get collocations(): Collocation | undefined {
    return this._collocations;
  }

  get idioms(): string[] | undefined {
    return this._idioms;
  }

  get phrases(): string[] | undefined {
    return this._phrases;
  }

  get verbPhrases(): string[] | undefined {
    return this._verbPhrases;
  }

  get images(): string[] | undefined {
    return this._images;
  }

  static create(props: WordSenseProps): WordSenseEntity {
    return new WordSenseEntity({
      id: v7(),
      ...props,
    });
  }
}
