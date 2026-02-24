import { ValueObject } from '@core/ddd';
import {
  ArgumentInvalidException,
  ArgumentNotProvidedException,
} from '@core/exceptions';

type CefrLevelValue = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export class CefrLevel extends ValueObject<{ value: CefrLevelValue }> {
  private static readonly VALID_LEVELS = new Set<string>([
    'A1',
    'A2',
    'B1',
    'B2',
    'C1',
    'C2',
  ]);

  get value(): CefrLevelValue {
    return this.props.value;
  }

  static from(level: string): CefrLevel {
    if (!level) {
      throw new ArgumentNotProvidedException('CEFR level cannot be empty');
    }

    const cleanLevel = level.trim().toUpperCase();

    if (!CefrLevel.VALID_LEVELS.has(cleanLevel)) {
      throw new ArgumentInvalidException(`Invalid CEFR level: ${level}`);
    }

    return new CefrLevel({ value: cleanLevel as CefrLevelValue });
  }
}
