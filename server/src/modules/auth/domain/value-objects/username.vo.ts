import { ValueObject } from '@core/ddd';
import { ArgumentInvalidException } from '@core/exceptions';

export class Username extends ValueObject<string> {
  constructor(value: string) {
    super({ value });
  }

  protected validate({ value }: { value: string }): void {
    // Regex: alphanumeric, dots, underscores. Max 50 chars.
    const usernameRegex = /^[a-z0-9._]{1,50}$/;
    if (!usernameRegex.test(value)) {
      throw new ArgumentInvalidException('Invalid username format');
    }
  }
}
