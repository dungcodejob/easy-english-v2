import { Injectable } from '@nestjs/common';
import { FsrsParameters } from '../value-objects/fsrs-parameters.vo';
import { ReviewRating } from '../value-objects/review-rating.vo';
import { CardState } from '../value-objects/card-state.vo';

@Injectable()
export class FsrsSchedulerService {
  private readonly requestRetention = 0.9;
  private readonly maximumInterval = 365;
  private readonly easyInterval = 4;
  private readonly hardInterval = 1;

  calculateNext(
    current: FsrsParameters,
    rating: ReviewRating,
    now: Date,
  ): FsrsParameters {
    const ratingValue = rating.value; // 1=Again, 2=Hard, 3=Good, 4=Easy

    let { stability, difficulty, lapses, reps } = current;
    let state = current.state;
    let dueDate: Date = new Date();

    if (state.value === 'new' || state.value === 'learning') {
      if (ratingValue >= 3) {
        stability = Math.max(1, this.computeInitialStability(ratingValue));
        difficulty = this.computeInitialDifficulty(ratingValue);
        reps = 1;
        state = CardState.REVIEW;
        dueDate = this.computeNextInterval(stability, difficulty, now);
      } else {
        stability = 0;
        difficulty = 0.3;
        lapses = ratingValue === 1 ? lapses + 1 : lapses;
        dueDate = new Date(now.getTime() + 10 * 60 * 1000);
      }
    } else if (state.value === 'review') {
      if (ratingValue === 1) {
        lapses += 1;
        reps = 0;
        stability = Math.max(0.1, stability * 0.1);
        state = CardState.LEARNING;
        dueDate = new Date(now.getTime() + 10 * 60 * 1000);
      } else {
        stability = this.updateStability(stability, difficulty, ratingValue);
        difficulty = this.updateDifficulty(difficulty, ratingValue);
        reps = reps + 1;
        dueDate = this.computeNextInterval(stability, difficulty, now);
      }
    } else if (state.value === 'relearning') {
      reps = reps > 0 ? reps : 1;
      stability = Math.max(0.1, stability * 0.5);
      state = CardState.REVIEW;
      dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    return new FsrsParameters({
      stability,
      difficulty,
      lapses,
      reps,
      state,
      dueDate,
      lastReviewDate: now,
    });
  }

  private computeInitialStability(rating: number): number {
    const score = this.ratingToScore(rating);
    return Math.max(1, 4 * score + 1);
  }

  private computeInitialDifficulty(rating: number): number {
    const score = this.ratingToScore(rating);
    return Math.min(1, Math.max(0, 0.3 + 0.7 * (1 - score)));
  }

  private ratingToScore(r: number): number {
    return [0, 0, 0.1, 0.6, 1.0][r] ?? 0;
  }

  private updateStability(s: number, d: number, rating: number): number {
    const score = this.ratingToScore(rating);
    const factor = rating === 4 ? 1.3 : rating === 2 ? 0.8 : 1.0;
    return Math.max(
      0.1,
      s * (1 + Math.exp(8 - 1.3 * (1 - d)) * (1 - score) * factor),
    );
  }

  private updateDifficulty(d: number, rating: number): number {
    const score = this.ratingToScore(rating);
    return Math.min(1, Math.max(0, d - 0.14 + 0.27 * (score - 0.5)));
  }

  private computeNextInterval(s: number, d: number, now: Date): Date {
    const rawInterval = s * (1 / this.requestRetention - 1);
    const intervalDays = Math.min(rawInterval, this.maximumInterval);
    const msPerDay = 24 * 60 * 60 * 1000;
    return new Date(now.getTime() + intervalDays * msPerDay);
  }
}
