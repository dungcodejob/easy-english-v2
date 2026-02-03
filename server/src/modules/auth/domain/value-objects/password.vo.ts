import { ValueObject } from '@core/ddd';

export class Password extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
    this.validate({ value });
  }

  public getHashedValue(): string {
    return this.props.value;
  }

  public static create(hashedValue: string): Password {
    return new Password(hashedValue);
  }

  protected validate({ value }: { value: string }): void {
    // We assume the value passed to constructor is ALREADY hashed
    if (!value) {
      // handled by base check if we want, or custom logic
    }
  }

  public compare(plainText: string): boolean {
    return plainText === this.props.value;
  }
}
