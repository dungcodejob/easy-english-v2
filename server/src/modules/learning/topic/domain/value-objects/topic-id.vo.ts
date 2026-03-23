import { ValueObject } from '@core/ddd';
import { ArgumentNotProvidedException } from '@core/exceptions';
import { v7 as uuid } from 'uuid';

export class TopicId extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  static generate(): TopicId {
    return new TopicId({ value: uuid() });
  }

  static from(id: string): TopicId {
    if (!id || id.trim().length === 0) {
      throw new ArgumentNotProvidedException('TopicId cannot be empty');
    }
    return new TopicId({ value: id });
  }
}
