import { ValueObject } from '@core/ddd';
import { ArgumentNotProvidedException } from '@core/exceptions';
import { v7 as uuid } from 'uuid';

export class FlashcardId extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  static generate(): FlashcardId {
    return new FlashcardId({ value: uuid() });
  }

  static from(id: string): FlashcardId {
    if (!id || id.trim().length === 0) {
      throw new ArgumentNotProvidedException('FlashcardId cannot be empty');
    }
    return new FlashcardId({ value: id });
  }
}
