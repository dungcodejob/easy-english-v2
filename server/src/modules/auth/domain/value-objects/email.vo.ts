import { ValueObject } from '@core/ddd';
import { ArgumentInvalidException } from '@core/exceptions';

export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
    this.validate({ value });
  }

  static create(value: string): Email {
    return new Email(value);
  }

  get value(): string {
    return this.props.value;
  }

  protected validate({ value }: { value: string }): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      throw new ArgumentInvalidException('Invalid email format');
    }
  }
}
