import { AggregateRoot } from '@core/ddd';
import { v7 } from 'uuid';
import { WordLearningRemovedEvent } from '../events/word-learning-removed.event';
import { WordLearningStartedEvent } from '../events/word-learning-started.event';
import { WordMasteredEvent } from '../events/word-mastered.event';
import { WordReviewedEvent } from '../events/word-reviewed.event';
import { AlreadyArchivedException } from '../exceptions/already-archived.exception';
import { FsrsParameters } from '../value-objects/fsrs-parameters.vo';
import { ReviewRating } from '../value-objects/review-rating.vo';

export class UserWordSenseProgress extends AggregateRoot {
  private _userId!: string;
  private _tenantId!: string;
  private _wordSenseId!: string;
  private _fsrsParams!: FsrsParameters;

  // Legacy fields — kept for ORM mapping during transition period (Phase 4).
  // Remove in Phase 5 cleanup.
  private _masteryLevel!: number;
  private _reviewCount!: number;
  private _nextReviewAt!: Date;
  private _lastReviewedAt!: Date | null;

  private _archivedAt!: Date | null;

  get userId(): string {
    return this._userId;
  }

  get tenantId(): string {
    return this._tenantId;
  }

  get wordSenseId(): string {
    return this._wordSenseId;
  }

  /** Returns the current FSRS scheduling parameters. */
  get fsrsParams(): FsrsParameters {
    return this._fsrsParams;
  }

  // Legacy getters — derive from _fsrsParams during Phase 4 transition.
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

  /**
   * A word is mastered when stability >= 30 AND no lapses have occurred.
   */
  get isMastered(): boolean {
    return this._fsrsParams.isMastered;
  }

  /**
   * A word is due when it has a scheduled review date and that date has passed.
   * null dueDate means never reviewed — not due until scheduled.
   */
  get isDue(): boolean {
    return (
      this._fsrsParams.dueDate !== null &&
      this._fsrsParams.dueDate <= new Date()
    );
  }

  static create(props: {
    userId: string;
    tenantId: string;
    wordSenseId: string;
  }): UserWordSenseProgress {
    const entity = new UserWordSenseProgress({
      id: v7(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    entity._userId = props.userId;
    entity._tenantId = props.tenantId;
    entity._wordSenseId = props.wordSenseId;
    entity._fsrsParams = FsrsParameters.newCardDefaults();
    // Legacy init
    entity._masteryLevel = 0;
    entity._reviewCount = 0;
    entity._nextReviewAt = new Date();
    entity._lastReviewedAt = null;
    entity._archivedAt = null;

    entity.addEvent(
      new WordLearningStartedEvent({
        aggregateId: entity.id,
        userId: entity._userId,
        tenantId: entity._tenantId,
        wordSenseId: entity._wordSenseId,
      }),
    );

    return entity;
  }

  static rehydrate(props: {
    id: string;
    userId: string;
    tenantId: string;
    wordSenseId: string;
    fsrsParams: FsrsParameters;
    // Legacy fields — read from ORM during Phase 4 transition
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
    entity._tenantId = props.tenantId;
    entity._wordSenseId = props.wordSenseId;
    entity._fsrsParams = props.fsrsParams;
    entity._masteryLevel = props.masteryLevel;
    entity._reviewCount = props.reviewCount;
    entity._nextReviewAt = props.nextReviewAt;
    entity._lastReviewedAt = props.lastReviewedAt;
    entity._archivedAt = props.archivedAt;
    return entity;
  }

  /**
   * Apply a review rating and update FSRS scheduling state.
   *
   * The `newParams` are computed by the caller (handler) using `FsrsSchedulerService.calculateNext()`.
   * This keeps the domain entity free of service injection.
   *
   * @param rating      The user's review rating
   * @param now         Optional review timestamp (defaults to new Date())
   * @param newParams   Pre-computed FSRS parameters from the scheduler
   */
  applyReview(
    rating: ReviewRating,
    newParams: FsrsParameters,
    reviewDurationMs: number,
    sessionId?: string,
  ): void {
    if (this._archivedAt !== null) {
      throw new AlreadyArchivedException();
    }

    const previousParams = this._fsrsParams;
    this._fsrsParams = newParams;
    this.updateUpdatedAt();

    // Legacy sync
    this._masteryLevel = Math.min(100, Math.round(newParams.stability * 3));
    this._reviewCount += 1;
    this._nextReviewAt = newParams.dueDate ?? new Date();
    this._lastReviewedAt = newParams.lastReviewDate;

    this.addEvent(
      new WordReviewedEvent({
        aggregateId: this.id,
        userId: this._userId,
        tenantId: this._tenantId,
        wordSenseId: this._wordSenseId,
        rating,
        previousParams,
        newParams,
        reviewDurationMs,
        sessionId,
      }),
    );

    // Emit WordMasteredEvent if this review caused the word to become mastered
    if (!previousParams.isMastered && newParams.isMastered) {
      this.addEvent(
        new WordMasteredEvent({
          aggregateId: this.id,
          userId: this._userId,
          tenantId: this._tenantId,
          wordSenseId: this._wordSenseId,
        }),
      );
    }
  }

  restore(): void {
    this._archivedAt = null;
    this.updateUpdatedAt();
  }

  archive(): void {
    this._archivedAt = new Date();
    this.updateUpdatedAt();

    this.addEvent(
      new WordLearningRemovedEvent({
        aggregateId: this.id,
        userId: this._userId,
        tenantId: this._tenantId,
        wordSenseId: this._wordSenseId,
      }),
    );
  }
}
