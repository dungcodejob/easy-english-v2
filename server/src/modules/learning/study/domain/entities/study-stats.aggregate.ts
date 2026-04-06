import { v7 } from 'uuid';

import { AggregateRoot } from '@core/ddd';

import { type ReviewRating } from '../../../../flashcard/domain/value-objects/review-rating.vo';

export interface StudyStatsProps {
  tenantId: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalCardsReviewed: number;
  totalStudyTimeMinutes: number;
  masteredCards: number;
  lastStudyDate: Date | null;
}

export class StudyStats extends AggregateRoot {
  private _tenantId!: string;
  private _userId!: string;
  private _currentStreak!: number;
  private _longestStreak!: number;
  private _totalCardsReviewed!: number;
  private _totalStudyTimeMinutes!: number;
  private _masteredCards!: number;
  private _lastStudyDate!: Date | null;

  get tenantId(): string {
    return this._tenantId;
  }

  get userId(): string {
    return this._userId;
  }

  get currentStreak(): number {
    return this._currentStreak;
  }

  get longestStreak(): number {
    return this._longestStreak;
  }

  get totalCardsReviewed(): number {
    return this._totalCardsReviewed;
  }

  get totalStudyTimeMinutes(): number {
    return this._totalStudyTimeMinutes;
  }

  get masteredCards(): number {
    return this._masteredCards;
  }

  get lastStudyDate(): Date | null {
    return this._lastStudyDate;
  }

  static create(tenantId: string, userId: string): StudyStats {
    const stats = new StudyStats({
      id: v7(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    stats._tenantId = tenantId;
    stats._userId = userId;
    stats._currentStreak = 1;
    stats._longestStreak = 0;
    stats._totalCardsReviewed = 0;
    stats._totalStudyTimeMinutes = 0;
    stats._masteredCards = 0;
    stats._lastStudyDate = null;

    return stats;
  }

  static rehydrate(props: {
    id: string;
    props: StudyStatsProps;
    createdAt: Date;
    updatedAt: Date;
  }): StudyStats {
    const stats = new StudyStats({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    stats._tenantId = props.props.tenantId;
    stats._userId = props.props.userId;
    stats._currentStreak = props.props.currentStreak;
    stats._longestStreak = props.props.longestStreak;
    stats._totalCardsReviewed = props.props.totalCardsReviewed;
    stats._totalStudyTimeMinutes = props.props.totalStudyTimeMinutes;
    stats._masteredCards = props.props.masteredCards;
    stats._lastStudyDate = props.props.lastStudyDate;

    return stats;
  }

  recordReview(
    rating: ReviewRating,
    durationMs: number,
    isMastered: boolean,
  ): void {
    const now = new Date();

    if (this._lastStudyDate) {
      const daysDiff = Math.floor(
        (now.getTime() - this._lastStudyDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 0) {
        // Same day — streak unchanged
      } else if (daysDiff === 1) {
        this._currentStreak += 1;
      } else {
        this._currentStreak = 1;
      }
    } else {
      this._currentStreak = 1;
    }

    if (this._currentStreak > this._longestStreak) {
      this._longestStreak = this._currentStreak;
    }

    this._totalCardsReviewed += 1;
    this._totalStudyTimeMinutes += durationMs / (1000 * 60);
    if (isMastered) this._masteredCards += 1;
    this._lastStudyDate = now;
    this.updateUpdatedAt();
  }
}
