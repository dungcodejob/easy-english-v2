import { ValueObject } from '@core/ddd';
import { ArgumentInvalidException } from '@core/exceptions';

export class FlashcardSource extends ValueObject<{
  value: 'dictionary' | 'custom';
}> {
  private static readonly _dictionary = new FlashcardSource({
    value: 'dictionary',
  });
  private static readonly _custom = new FlashcardSource({ value: 'custom' });

  get value(): 'dictionary' | 'custom' {
    return this.props.value;
  }

  static get dictionary(): FlashcardSource {
    return FlashcardSource._dictionary;
  }

  static get custom(): FlashcardSource {
    return FlashcardSource._custom;
  }

  static from(value: string): FlashcardSource {
    if (value === 'dictionary') return FlashcardSource.dictionary;
    if (value === 'custom') return FlashcardSource.custom;
    throw new ArgumentInvalidException(`Invalid FlashcardSource: ${value}`);
  }
}
