import { v7 } from 'uuid';

import { ValueObject } from '@core/ddd';
import { ArgumentNotProvidedException } from '@core/exceptions';

export class WordId extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  static generate(): WordId {
    return new WordId({ value: v7() });
  }

  static from(id: string): WordId {
    if (!id || id.trim().length === 0) {
      throw new ArgumentNotProvidedException('WordId cannot be empty');
    }

    return new WordId({ value: id });
  }
}
