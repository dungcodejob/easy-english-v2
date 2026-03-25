import { ValueObject } from '@core/ddd';
import { ArgumentInvalidException } from '@core/exceptions';

export class ReviewRating extends ValueObject<{ value: 1 | 2 | 3 | 4 }> {
  private static readonly _Again = new ReviewRating({ value: 1 });
  private static readonly _Hard = new ReviewRating({ value: 2 });
  private static readonly _Good = new ReviewRating({ value: 3 });
  private static readonly _Easy = new ReviewRating({ value: 4 });

  get value(): 1 | 2 | 3 | 4 {
    return this.props.value;
  }

  static get Again(): ReviewRating {
    return ReviewRating._Again;
  }

  static get Hard(): ReviewRating {
    return ReviewRating._Hard;
  }

  static get Good(): ReviewRating {
    return ReviewRating._Good;
  }

  static get Easy(): ReviewRating {
    return ReviewRating._Easy;
  }

  static from(value: number): ReviewRating {
    if (value === 1) return ReviewRating.Again;
    if (value === 2) return ReviewRating.Hard;
    if (value === 3) return ReviewRating.Good;
    if (value === 4) return ReviewRating.Easy;
    throw new ArgumentInvalidException(`Invalid ReviewRating: ${value}`);
  }

  isAgain(): boolean {
    return this.props.value === 1;
  }
}
