import { AggregateRoot } from '@core/ddd';
import { v7 } from 'uuid';
import { WordCreatedEvent } from '../events/word-created.event';
import { WordUpdatedEvent } from '../events/word-updated.event';
import { DataSource } from '../value-objects/data-source.vo';
import { Language } from '../value-objects/language.vo';
import { WordId } from '../value-objects/word-id.vo';
import { WordPronunciationVO } from '../value-objects/word-pronunciation.vo';
import { WordSenseVO } from '../value-objects/word-sense.vo';
import { WordText } from '../value-objects/word-text.vo';
import { WordFamily, WordProps } from './word-props.interface';

export class Word extends AggregateRoot {
  private _version!: number;
  private _text!: WordText;
  private _normalizedText!: WordText;
  private _language!: Language;
  private _source!: DataSource;
  private _rank!: number | null;
  private _frequency!: number | null;
  private _pronunciations!: WordPronunciationVO[];
  private _senses!: WordSenseVO[];
  private _inflects?: Record<string, string[]>;
  private _wordFamily?: WordFamily;

  // ─── Getters (read-only access) ───
  get wordId(): WordId {
    return WordId.from(this.id);
  }

  get version(): number {
    return this._version;
  }

  get text(): WordText {
    return this._text;
  }

  get normalizedText(): WordText {
    return this._normalizedText;
  }

  get language(): Language {
    return this._language;
  }

  get source(): DataSource {
    return this._source;
  }

  get rank(): number | null {
    return this._rank;
  }

  get frequency(): number | null {
    return this._frequency;
  }

  get pronunciations(): WordPronunciationVO[] {
    return this._pronunciations;
  }

  get senses(): WordSenseVO[] {
    return this._senses;
  }

  get inflects(): Record<string, string[]> | undefined {
    return this._inflects;
  }

  get wordFamily(): WordFamily | undefined {
    return this._wordFamily;
  }

  // ─── Factory: create from provider data (first time) ───
  static createFromProvider(props: {
    id?: string;
    wordProps: WordProps;
  }): Word {
    const word = new Word({
      id: props.id ?? v7(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    word.assignProps(props.wordProps);
    word._version = 1;

    word.addEvent(
      new WordCreatedEvent({
        aggregateId: word.id,
        word,
      }),
    );

    return word;
  }

  // ─── Factory: reconstitute from DB ───
  static rehydrate(props: {
    id: string;
    wordProps: WordProps;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  }): Word {
    const word = new Word({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    word.assignProps(props.wordProps);
    word._version = props.version;
    return word;
  }

  // ─── Domain Behavior ───
  updateFromProvider(newProps: WordProps): void {
    if (this.isIdentical(newProps)) {
      return; // No-op if identical
    }

    const previousVersion = this._version;
    this.assignProps(newProps);
    this._version += 1;
    this.updateUpdatedAt();

    this.addEvent(
      new WordUpdatedEvent({
        aggregateId: this.id,
        word: this,
        previousVersion,
      }),
    );
  }

  private assignProps(props: WordProps): void {
    this._text = props.text;
    this._normalizedText = props.normalizedText;
    this._language = props.language;
    this._source = props.source;
    this._rank = props.rank;
    this._frequency = props.frequency;
    this._pronunciations = props.pronunciations;
    this._senses = props.senses;
    this._inflects = props.inflects;
    this._wordFamily = props.wordFamily;
  }

  private isIdentical(newProps: WordProps): boolean {
    // Basic equality check. For deep equality on senses/pronunciations, we might need a more robust equality function.
    // For now, testing if the source and normalized text match, but in a real DDD scenario, we'd deep compare.
    return (
      this._normalizedText.equals(newProps.normalizedText) &&
      this._source.equals(newProps.source) &&
      this._senses.length === newProps.senses.length &&
      this._pronunciations.length === newProps.pronunciations.length
    );
  }
}
