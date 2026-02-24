import { ValueObject } from '@core/ddd';
import {
  ArgumentInvalidException,
  ArgumentNotProvidedException,
} from '@core/exceptions';

export class Language extends ValueObject<{ value: string }> {
  static readonly ENGLISH = new Language({ value: 'en' });
  static readonly VIETNAMESE = new Language({ value: 'vi' });

  get value(): string {
    return this.props.value;
  }

  static from(code: string): Language {
    if (!code) {
      throw new ArgumentNotProvidedException('Language code cannot be empty');
    }
    const cleanCode = code.trim().toLowerCase();

    if (!/^[a-z]{2}$/.test(cleanCode)) {
      throw new ArgumentInvalidException(
        `Invalid Language code format: ${code}`,
      );
    }

    // For now we only explicitly support these two, but we allow creating others if they match the format
    if (cleanCode === 'en') return Language.ENGLISH;
    if (cleanCode === 'vi') return Language.VIETNAMESE;

    return new Language({ value: cleanCode });
  }
}
