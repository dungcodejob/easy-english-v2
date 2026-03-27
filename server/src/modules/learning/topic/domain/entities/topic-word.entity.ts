import { v7 as uuid } from 'uuid';

import { WordLearningStatus } from '../value-objects/word-learning-status.vo';

/**
 * TopicWord is a child entity managed by the Topic aggregate.
 *
 * The `_status` field is a placeholder for ORM rehydration compatibility only.
 * It is NOT the source of truth — status is derived from UserWordSenseProgress
 * at read time in TopicMapper.toResponse().
 */
export class TopicWord {
  private readonly _id: string;
  private readonly _wordSenseId: string;
  private readonly _addedAt: Date;

  // Placeholder only — not used as source of truth
  private readonly _status: WordLearningStatus;

  get id(): string {
    return this._id;
  }

  get wordSenseId(): string {
    return this._wordSenseId;
  }

  /** @deprecated Not the source of truth — status is derived at read time from UserWordSenseProgress */
  get status(): WordLearningStatus {
    return this._status;
  }

  get addedAt(): Date {
    return this._addedAt;
  }

  private constructor(
    id: string,
    wordSenseId: string,
    status: WordLearningStatus,
    addedAt: Date,
  ) {
    this._id = id;
    this._wordSenseId = wordSenseId;
    this._status = status;
    this._addedAt = addedAt;
  }

  static create(wordSenseId: string): TopicWord {
    return new TopicWord(
      uuid(),
      wordSenseId,
      WordLearningStatus.NEW,
      new Date(),
    );
  }

  /**
   * @deprecated ORM no longer has a status column — status is always NEW for rehydration.
   *             The real status comes from UserWordSenseProgress at read time.
   */
  static rehydrate(id: string, wordSenseId: string, addedAt: Date): TopicWord {
    return new TopicWord(id, wordSenseId, WordLearningStatus.NEW, addedAt);
  }
}
