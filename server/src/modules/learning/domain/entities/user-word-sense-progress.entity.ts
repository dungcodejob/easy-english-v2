import { AggregateRoot } from '@core/ddd';
import { v7 } from 'uuid';

export class UserWordSenseProgress extends AggregateRoot {
  private _userId!: string;
  private _wordSenseId!: string;
  private _masteryLevel!: number;
  private _reviewCount!: number;
  private _nextReviewAt!: Date;
  private _lastReviewedAt!: Date | null;
  private _archivedAt!: Date | null;

  get userId(): string {
    return this._userId;
  }

  get wordSenseId(): string {
    return this._wordSenseId;
  }

  get masteryLevel(): number {
    return this._masteryLevel;
  }

  get reviewCount(): number {
    return this._reviewCount;
  }

  get nextReviewAt(): Date {
    return this._nextReviewAt;
  }

  get lastReviewedAt(): Date | null {
    return this._lastReviewedAt;
  }

  get archivedAt(): Date | null {
    return this._archivedAt;
  }

  get isArchived(): boolean {
    return this._archivedAt !== null;
  }

  static create(props: {
    userId: string;
    wordSenseId: string;
  }): UserWordSenseProgress {
    const entity = new UserWordSenseProgress({
      id: v7(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    entity._userId = props.userId;
    entity._wordSenseId = props.wordSenseId;
    entity._masteryLevel = 0;
    entity._reviewCount = 0;
    entity._nextReviewAt = new Date();
    entity._lastReviewedAt = null;
    entity._archivedAt = null;
    return entity;
  }

  static rehydrate(props: {
    id: string;
    userId: string;
    wordSenseId: string;
    masteryLevel: number;
    reviewCount: number;
    nextReviewAt: Date;
    lastReviewedAt: Date | null;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserWordSenseProgress {
    const entity = new UserWordSenseProgress({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    entity._userId = props.userId;
    entity._wordSenseId = props.wordSenseId;
    entity._masteryLevel = props.masteryLevel;
    entity._reviewCount = props.reviewCount;
    entity._nextReviewAt = props.nextReviewAt;
    entity._lastReviewedAt = props.lastReviewedAt;
    entity._archivedAt = props.archivedAt;
    return entity;
  }

  restore(): void {
    this._archivedAt = null;
    this.updateUpdatedAt();
  }

  archive(): void {
    this._archivedAt = new Date();
    this.updateUpdatedAt();
  }
}
