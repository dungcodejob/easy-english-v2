export class Password {
  constructor(
    private readonly value: string,
    private readonly hashed: boolean = false,
  ) {}

  static create(password: string): Password {
    // Validation logic (min 8 chars, etc) could go here or in a service
    // For VO, just holding the value
    return new Password(password, false);
  }

  static fromHash(hash: string): Password {
    return new Password(hash, true);
  }

  getValue(): string {
    return this.value;
  }

  isHashed(): boolean {
    return this.hashed;
  }
}
