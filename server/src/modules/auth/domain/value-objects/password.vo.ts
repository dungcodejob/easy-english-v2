import { ValueObject } from '@core/ddd';
import { IPasswordHasher } from '../ports/password-hasher.interface';

export class Password extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
    this.validate({ value });
  }

  public getHashedValue(): string {
    return this.props.value;
  }

  public static async create(
    plainText: string,
    hasher: IPasswordHasher,
  ): Promise<Password> {
    const hash = await hasher.hash(plainText);
    return new Password(hash);
  }

  protected validate({ value }: { value: string }): void {
    // We assume the value passed to constructor is ALREADY hashed
    if (!value) {
      // handled by base check if we want, or custom logic
    }
  }

  public async compare(
    plainText: string,
    hasher: IPasswordHasher,
  ): Promise<boolean> {
    return hasher.compare(plainText, this.props.value);
  }
}
