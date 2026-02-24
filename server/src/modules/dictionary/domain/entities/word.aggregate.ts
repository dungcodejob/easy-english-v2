import { AggregateRoot } from '@core/ddd';
import { v7 } from 'uuid';
import { WordCreatedEvent } from '../events/word-created.event';
import { WordUpdatedEvent } from '../events/word-updated.event';
import { DataSource } from '../value-objects/data-source.vo';
import { Language } from '../value-objects/language.vo';
import { WordId } from '../value-objects/word-id.vo';
import { WordSnapshot } from '../value-objects/word-snapshot.vo';
import { WordText } from '../value-objects/word-text.vo';

export class Word extends AggregateRoot {
  private _snapshot!: WordSnapshot;
  private _version!: number;
  private _source!: DataSource;

  // ─── Getters (read-only access) ───
  get wordId(): WordId {
    return WordId.from(this.id);
  }

  get snapshot(): WordSnapshot {
    return this._snapshot;
  }

  get version(): number {
    return this._version;
  }

  get source(): DataSource {
    return this._source;
  }

  get normalizedText(): WordText {
    return this._snapshot.normalizedText;
  }

  get language(): Language {
    return this._snapshot.language;
  }

  // ─── Factory: create from provider data (first time) ───
  static createFromProvider(props: {
    id?: string;
    snapshot: WordSnapshot;
    source: DataSource;
    tenantId: string;
  }): Word {
    const word = new Word({
      id: props.id ?? v7(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    word._snapshot = props.snapshot;
    word._version = 1;
    word._source = props.source;

    word.addEvent(
      new WordCreatedEvent({
        aggregateId: word.id,
        word,
        tenantId: props.tenantId,
      }),
    );

    return word;
  }

  // ─── Factory: reconstitute from DB ───
  static reconstitute(props: {
    id: string;
    snapshot: WordSnapshot;
    source: DataSource;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  }): Word {
    const word = new Word({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    word._snapshot = props.snapshot;
    word._version = props.version;
    word._source = props.source;
    return word;
  }

  // ─── Domain Behavior ───
  updateFromProvider(newSnapshot: WordSnapshot, tenantId: string): void {
    if (this._snapshot.equals(newSnapshot)) {
      return; // No-op if identical
    }

    const previousVersion = this._version;
    this._snapshot = newSnapshot;
    this._version += 1;
    this.updateUpdatedAt();

    this.addEvent(
      new WordUpdatedEvent({
        aggregateId: this.id,
        word: this,
        previousVersion,
        tenantId,
      }),
    );
  }
}
