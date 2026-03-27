import { Entity } from '@core/ddd';
import { v7 as uuid } from 'uuid';

export class StudyReviewLog extends Entity {
  private _sessionId!: string;
  private _userId!: string;
  private _tenantId!: string;
  private _wordSenseId!: string;
  private _rating!: 1 | 2 | 3 | 4;
  private _reviewDurationMs!: number;
  private _reviewedAt!: Date;

  get sessionId(): string {
    return this._sessionId;
  }

  get userId(): string {
    return this._userId;
  }

  get tenantId(): string {
    return this._tenantId;
  }

  get wordSenseId(): string {
    return this._wordSenseId;
  }

  get rating(): 1 | 2 | 3 | 4 {
    return this._rating;
  }

  get reviewDurationMs(): number {
    return this._reviewDurationMs;
  }

  get reviewedAt(): Date {
    return this._reviewedAt;
  }

  static create(props: {
    sessionId: string;
    userId: string;
    tenantId: string;
    wordSenseId: string;
    rating: 1 | 2 | 3 | 4;
    reviewDurationMs: number;
    reviewedAt?: Date;
  }): StudyReviewLog {
    const entity = new StudyReviewLog({
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    entity._sessionId = props.sessionId;
    entity._userId = props.userId;
    entity._tenantId = props.tenantId;
    entity._wordSenseId = props.wordSenseId;
    entity._rating = props.rating;
    entity._reviewDurationMs = props.reviewDurationMs;
    entity._reviewedAt = props.reviewedAt ?? new Date();

    return entity;
  }

  static rehydrate(props: {
    id: string;
    sessionId: string;
    userId: string;
    tenantId: string;
    wordSenseId: string;
    rating: 1 | 2 | 3 | 4;
    reviewDurationMs: number;
    reviewedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): StudyReviewLog {
    const entity = new StudyReviewLog({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    entity._sessionId = props.sessionId;
    entity._userId = props.userId;
    entity._tenantId = props.tenantId;
    entity._wordSenseId = props.wordSenseId;
    entity._rating = props.rating;
    entity._reviewDurationMs = props.reviewDurationMs;
    entity._reviewedAt = props.reviewedAt;

    return entity;
  }
}
