import { ValueObject } from '@core/ddd';
import { ArgumentInvalidException } from '@core/exceptions';

export type CardStateValue =
  | 'new'
  | 'learning'
  | 'review'
  | 'relearning'
  | 'grace';

export class CardState extends ValueObject<{ value: CardStateValue }> {
  private static readonly _new = new CardState({ value: 'new' });
  private static readonly _learning = new CardState({ value: 'learning' });
  private static readonly _review = new CardState({ value: 'review' });
  private static readonly _relearning = new CardState({ value: 'relearning' });
  private static readonly _grace = new CardState({ value: 'grace' });

  get value(): CardStateValue {
    return this.props.value;
  }

  static get NEW(): CardState {
    return CardState._new;
  }

  static get LEARNING(): CardState {
    return CardState._learning;
  }

  static get REVIEW(): CardState {
    return CardState._review;
  }

  static get RELEARNING(): CardState {
    return CardState._relearning;
  }

  /**
   * Grace is entered after a lapse — card re-enters relearning with a short
   * interval (10min → 1day → review). It is a transitional state.
   */
  static get GRACE(): CardState {
    return CardState._grace;
  }

  static from(value: string): CardState {
    if (value === 'new') return CardState.NEW;
    if (value === 'learning') return CardState.LEARNING;
    if (value === 'review') return CardState.REVIEW;
    if (value === 'relearning') return CardState.RELEARNING;
    if (value === 'grace') return CardState.GRACE;
    throw new ArgumentInvalidException(`Invalid CardState: ${value}`);
  }
}
