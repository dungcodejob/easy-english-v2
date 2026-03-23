import { v7 as uuid } from 'uuid';
import { WordLearningStatus } from '../value-objects/word-learning-status.vo';

export class TopicWord {
  private readonly _id: string;
  private readonly _wordSenseId: string;
  private _status: WordLearningStatus;
  private readonly _addedAt: Date;

  get id(): string {
    return this._id;
  }

  get wordSenseId(): string {
    return this._wordSenseId;
  }

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

  static rehydrate(
    id: string,
    wordSenseId: string,
    status: WordLearningStatus,
    addedAt: Date,
  ): TopicWord {
    return new TopicWord(id, wordSenseId, status, addedAt);
  }

  updateStatus(status: WordLearningStatus): void {
    this._status = status;
  }
}
