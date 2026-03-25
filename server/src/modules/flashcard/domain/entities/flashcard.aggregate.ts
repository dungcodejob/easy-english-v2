import { AggregateRoot } from '@core/ddd';
import { v7 } from 'uuid';
import { FlashcardSource } from '../value-objects/flashcard-source.vo';
import { FlashcardCreatedEvent } from '../events/flashcard-created.event';
import { FlashcardUpdatedEvent } from '../events/flashcard-updated.event';
import { FlashcardDeletedEvent } from '../events/flashcard-deleted.event';

export interface FlashcardProps {
  tenantId: string;
  userId: string;
  front: string;
  back: string;
  hint: string | null;
  notes: string | null;
  source: FlashcardSource;
  wordSenseId: string | null;
}

export class Flashcard extends AggregateRoot {
  private _tenantId!: string;
  private _userId!: string;
  private _front!: string;
  private _back!: string;
  private _hint!: string | null;
  private _notes!: string | null;
  private _source!: FlashcardSource;
  private _wordSenseId!: string | null;

  get tenantId(): string {
    return this._tenantId;
  }

  get userId(): string {
    return this._userId;
  }

  get front(): string {
    return this._front;
  }

  get back(): string {
    return this._back;
  }

  get hint(): string | null {
    return this._hint;
  }

  get notes(): string | null {
    return this._notes;
  }

  get source(): FlashcardSource {
    return this._source;
  }

  get wordSenseId(): string | null {
    return this._wordSenseId;
  }

  static create(props: {
    tenantId: string;
    userId: string;
    front: string;
    back: string;
    source: FlashcardSource;
    hint?: string | null;
    notes?: string | null;
    wordSenseId?: string | null;
  }): Flashcard {
    const flashcard = new Flashcard({
      id: v7(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    flashcard._tenantId = props.tenantId;
    flashcard._userId = props.userId;
    flashcard._front = props.front;
    flashcard._back = props.back;
    flashcard._hint = props.hint ?? null;
    flashcard._notes = props.notes ?? null;
    flashcard._source = props.source;
    flashcard._wordSenseId = props.wordSenseId ?? null;

    flashcard.addEvent(
      new FlashcardCreatedEvent({ aggregateId: flashcard.id, flashcard }),
    );
    return flashcard;
  }

  static rehydrate(
    props: {
      id: string;
      tenantId: string;
      userId: string;
      front: string;
      back: string;
      hint: string | null;
      notes: string | null;
      source: FlashcardSource;
      wordSenseId: string | null;
    },
    createdAt: Date,
    updatedAt: Date,
  ): Flashcard {
    const flashcard = new Flashcard({ id: props.id, createdAt, updatedAt });
    flashcard._tenantId = props.tenantId;
    flashcard._userId = props.userId;
    flashcard._front = props.front;
    flashcard._back = props.back;
    flashcard._hint = props.hint;
    flashcard._notes = props.notes;
    flashcard._source = props.source;
    flashcard._wordSenseId = props.wordSenseId;
    return flashcard;
  }

  updateContent(props: {
    front: string;
    back: string;
    hint?: string | null;
    notes?: string | null;
  }): void {
    this._front = props.front;
    this._back = props.back;
    this._hint = props.hint ?? this._hint;
    this._notes = props.notes ?? this._notes;
    this.updateUpdatedAt();
    this.addEvent(
      new FlashcardUpdatedEvent({ aggregateId: this.id, flashcard: this }),
    );
  }

  markDeleted(): void {
    this.addEvent(
      new FlashcardDeletedEvent({
        aggregateId: this.id,
        flashcardId: this.id,
        userId: this._userId,
        tenantId: this._tenantId,
      }),
    );
  }
}
