import { ValueObject } from '@core/ddd';
import { ArgumentInvalidException } from '@core/exceptions';

/**
 * Username Value Object
 *
 * Constraints:
 * - Length: 3-30 characters
 * - Characters: lowercase alphanumeric + underscore (a-z, 0-9, _)
 * - Must start with a letter
 * - No consecutive underscores
 *
 * Responsibilities:
 * - Normalize (lowercase, trim)
 * - Validate format/length/charset (invariants)
 * - Immutable
 */
export class Username extends ValueObject<string> {
  static readonly MIN_LENGTH = 3;
  static readonly MAX_LENGTH = 30;
  static readonly PATTERN = /^[a-z][a-z0-9_]*$/;

  private constructor(value: string) {
    super({ value });
    this.validate({ value });
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Create Username from raw input with normalization
   */
  static create(raw: string): Username {
    const normalized = Username.normalize(raw);

    return new Username(normalized);
  }

  /**
   * Create Username with sequential suffix (e.g., john_doe_1, john_doe_2)
   */
  withSuffix(suffix: number): Username {
    const base = this.getBaseName();
    const newValue = `${base}_${suffix}`;

    // Ensure still within max length
    if (newValue.length > Username.MAX_LENGTH) {
      // Truncate base to fit suffix
      const maxBase = Username.MAX_LENGTH - `_${suffix}`.length;
      const truncatedBase = base.substring(0, maxBase);

      return Username.create(`${truncatedBase}_${suffix}`);
    }

    return Username.create(newValue);
  }

  /**
   * Get base name without trailing numeric suffix
   * e.g., john_doe_123 → john_doe
   */
  private getBaseName(): string {
    // Remove trailing _number pattern
    return this.props.value.replace(/_\d+$/, '');
  }

  /**
   * Normalize raw input:
   * - Trim whitespace
   * - Lowercase
   * - Replace dots and hyphens with underscore
   * - Remove consecutive underscores
   * - Remove invalid characters
   * - Ensure starts with letter
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static normalize(raw: string): string {
    let value = raw
      .trim()
      .toLowerCase()
      .replace(/[.-]/g, '_') // Replace dots and hyphens with underscore
      .replace(/[^a-z0-9_]/g, '') // Remove invalid characters
      .replace(/_+/g, '_') // Remove consecutive underscores
      .replace(/^_+/, '') // Remove leading underscores
      .replace(/_+$/, ''); // Remove trailing underscores

    // Ensure starts with a letter
    while (value.length > 0 && !/^[a-z]/.test(value)) {
      value = value.substring(1);
    }

    // Truncate to max length (leave room for potential suffix)
    value = value.substring(0, Username.MAX_LENGTH - 4);

    // If too short, pad with default
    if (value.length < Username.MIN_LENGTH) {
      value = `user_${value || 'x'}`;
    }

    return value;
  }

  private validate({ value }: { value: string }): void {
    if (value.length < Username.MIN_LENGTH) {
      throw new ArgumentInvalidException(
        `Username must be at least ${Username.MIN_LENGTH} characters`,
      );
    }

    if (value.length > Username.MAX_LENGTH) {
      throw new ArgumentInvalidException(
        `Username must be at most ${Username.MAX_LENGTH} characters`,
      );
    }

    if (!Username.PATTERN.test(value)) {
      throw new ArgumentInvalidException(
        'Username must start with a letter and contain only lowercase letters, numbers, and underscores',
      );
    }

    if (value.includes('__')) {
      throw new ArgumentInvalidException(
        'Username cannot contain consecutive underscores',
      );
    }
  }
}
