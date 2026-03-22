import { ValueObject } from '@core/ddd';
import { CardState } from './card-state.vo';

export interface FsrsParametersProps {
  stability: number;
  difficulty: number;
  lapses: number;
  reps: number;
  state: CardState;
  dueDate: Date | null;
  lastReviewDate: Date | null;
}

/**
 * FSRS (Free Spaced Repetition Scheduler) parameters value object.
 * Encapsulates scheduling state for a flashcard.
 */
export class FsrsParameters extends ValueObject<FsrsParametersProps> {
  get stability(): number {
    return this.props.stability;
  }

  get difficulty(): number {
    return this.props.difficulty;
  }

  get lapses(): number {
    return this.props.lapses;
  }

  get reps(): number {
    return this.props.reps;
  }

  get state(): CardState {
    return this.props.state;
  }

  get dueDate(): Date | null {
    return this.props.dueDate;
  }

  get lastReviewDate(): Date | null {
    return this.props.lastReviewDate;
  }

  /**
   * A card is considered mastered when stability >= 30 AND no lapses have occurred.
   * This is a derived property — it is not stored, only computed.
   */
  get isMastered(): boolean {
    return this.props.stability >= 30 && this.props.lapses === 0;
  }

  static newCardDefaults(): FsrsParameters {
    return new FsrsParameters({
      stability: 0,
      difficulty: 0,
      lapses: 0,
      reps: 0,
      state: CardState.NEW,
      dueDate: null,
      lastReviewDate: null,
    });
  }
}
