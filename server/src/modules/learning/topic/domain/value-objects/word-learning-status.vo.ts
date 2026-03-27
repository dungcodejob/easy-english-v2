import { ValueObject } from '@core/ddd';

export class WordLearningStatus extends ValueObject<{
  value: 'NEW' | 'LEARNING' | 'MASTERED';
}> {
  private static readonly _NEW = new WordLearningStatus({ value: 'NEW' });
  private static readonly _LEARNING = new WordLearningStatus({
    value: 'LEARNING',
  });

  private static readonly _MASTERED = new WordLearningStatus({
    value: 'MASTERED',
  });

  get value(): 'NEW' | 'LEARNING' | 'MASTERED' {
    return this.props.value;
  }

  static get NEW(): WordLearningStatus {
    return WordLearningStatus._NEW;
  }

  static get LEARNING(): WordLearningStatus {
    return WordLearningStatus._LEARNING;
  }

  static get MASTERED(): WordLearningStatus {
    return WordLearningStatus._MASTERED;
  }

  static from(value: string): WordLearningStatus {
    if (value === 'NEW') return WordLearningStatus.NEW;
    if (value === 'LEARNING') return WordLearningStatus.LEARNING;
    if (value === 'MASTERED') return WordLearningStatus.MASTERED;
    throw new Error(`Invalid WordLearningStatus: ${value}`);
  }
}
