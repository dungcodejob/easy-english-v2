import { v7 } from 'uuid';

import { Entity } from '@core/ddd';

import { type CardState } from '../../../learning/progress/domain/value-objects/card-state.vo';
import { type FsrsParameters } from '../../../learning/progress/domain/value-objects/fsrs-parameters.vo';
import { type ReviewRating } from '../../../learning/progress/domain/value-objects/review-rating.vo';
import { type FlashcardId } from '../value-objects/flashcard-id.vo';

/**
 * cardId and wordSenseId are mutually exclusive.
 * - Card review: cardId set, wordSenseId undefined
 * - Dictionary review (ReviewWordHandler): wordSenseId set, cardId null
 */
export interface ReviewLogProps {
  cardId: FlashcardId | null;
  wordSenseId?: string;
  userId: string;
  tenantId: string;
  rating: ReviewRating;
  previousState: CardState;
  newState: CardState;
  previousParams: FsrsParameters;
  newParams: FsrsParameters;
  reviewDurationMs: number;
  reviewedAt: Date;
}

export class ReviewLog extends Entity {
  private _cardId!: FlashcardId | null;
  private _wordSenseId?: string;
  private _userId!: string;
  private _tenantId!: string;
  private _rating!: ReviewRating;
  private _previousState!: CardState;
  private _newState!: CardState;
  private _previousStability!: number;
  private _newStability!: number;
  private _previousDifficulty!: number;
  private _newDifficulty!: number;
  private _reviewDurationMs!: number;
  private _reviewedAt!: Date;

  get cardId(): FlashcardId | null {
    return this._cardId;
  }

  get wordSenseId(): string | undefined {
    return this._wordSenseId;
  }

  get userId(): string {
    return this._userId;
  }

  get tenantId(): string {
    return this._tenantId;
  }

  get rating(): ReviewRating {
    return this._rating;
  }

  get previousState(): CardState {
    return this._previousState;
  }

  get newState(): CardState {
    return this._newState;
  }

  get previousStability(): number {
    return this._previousStability;
  }

  get newStability(): number {
    return this._newStability;
  }

  get previousDifficulty(): number {
    return this._previousDifficulty;
  }

  get newDifficulty(): number {
    return this._newDifficulty;
  }

  get reviewDurationMs(): number {
    return this._reviewDurationMs;
  }

  get reviewedAt(): Date {
    return this._reviewedAt;
  }

  static create(props: ReviewLogProps): ReviewLog {
    const log = new ReviewLog({
      id: v7(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    log._cardId = props.cardId;
    log._wordSenseId = props.wordSenseId;
    log._userId = props.userId;
    log._tenantId = props.tenantId;
    log._rating = props.rating;
    log._previousState = props.previousState;
    log._newState = props.newState;
    log._previousStability = props.previousParams.stability;
    log._newStability = props.newParams.stability;
    log._previousDifficulty = props.previousParams.difficulty;
    log._newDifficulty = props.newParams.difficulty;
    log._reviewDurationMs = props.reviewDurationMs;
    log._reviewedAt = props.reviewedAt;

    return log;
  }

  static rehydrate(props: {
    id: string;
    props: ReviewLogProps;
    createdAt: Date;
    updatedAt: Date;
  }): ReviewLog {
    const log = new ReviewLog({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    log._cardId = props.props.cardId;
    log._wordSenseId = props.props.wordSenseId;
    log._userId = props.props.userId;
    log._tenantId = props.props.tenantId;
    log._rating = props.props.rating;
    log._previousState = props.props.previousState;
    log._newState = props.props.newState;
    log._previousStability = props.props.previousParams.stability;
    log._newStability = props.props.newParams.stability;
    log._previousDifficulty = props.props.previousParams.difficulty;
    log._newDifficulty = props.props.newParams.difficulty;
    log._reviewDurationMs = props.props.reviewDurationMs;
    log._reviewedAt = props.props.reviewedAt;

    return log;
  }
}
