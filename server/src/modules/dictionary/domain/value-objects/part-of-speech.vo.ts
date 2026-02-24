import { ValueObject } from '@core/ddd';
import { ArgumentNotProvidedException } from '@core/exceptions';

export class PartOfSpeech extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  static from(pos: string): PartOfSpeech {
    if (!pos) {
      throw new ArgumentNotProvidedException('Part of speech cannot be empty');
    }

    const cleanPos = pos.trim().toLowerCase();
    return new PartOfSpeech({ value: cleanPos });
  }
}
