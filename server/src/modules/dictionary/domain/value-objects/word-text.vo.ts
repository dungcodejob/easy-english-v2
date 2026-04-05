import { ValueObject } from '@core/ddd';
import { ArgumentNotProvidedException } from '@core/exceptions';

export class WordText extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  static create(text: string): WordText {
    const trimmed = text?.trim();

    if (!trimmed) {
      throw new ArgumentNotProvidedException('Word text cannot be empty');
    }

    return new WordText({ value: trimmed });
  }

  normalize(): WordText {
    return WordText.create(this.props.value.toLowerCase());
  }
}
