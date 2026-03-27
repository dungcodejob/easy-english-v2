import { AggregateRoot } from '@core/ddd';
import { v7 as uuid } from 'uuid';
import { StudySessionCompletedEvent } from '../events/study-session-completed.event';
import { StudySessionStartedEvent } from '../events/study-session-started.event';

export type StudySessionScope = 'DUE' | 'TOPIC';
export type StudySessionType = 'FLASHCARD';
export type StudySessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export class StudySession extends AggregateRoot {
  private _userId!: string;
  private _tenantId!: string;
  private _scope!: StudySessionScope;
  private _studyType!: StudySessionType;
  private _topicId!: string | null;
  private _enrolledCardIds!: string[];
  private _reviewedCount!: number;
  private _againCount!: number;
  private _hardCount!: number;
  private _goodCount!: number;
  private _easyCount!: number;
  private _status!: StudySessionStatus;
  private _startedAt!: Date;
  private _completedAt!: Date | null;
  private _abandonedAt!: Date | null;

  get userId(): string {
    return this._userId;
  }

  get tenantId(): string {
    return this._tenantId;
  }

  get scope(): StudySessionScope {
    return this._scope;
  }

  get studyType(): StudySessionType {
    return this._studyType;
  }

  get topicId(): string | null {
    return this._topicId;
  }

  get enrolledCardIds(): string[] {
    return [...this._enrolledCardIds];
  }

  get reviewedCount(): number {
    return this._reviewedCount;
  }

  get againCount(): number {
    return this._againCount;
  }

  get hardCount(): number {
    return this._hardCount;
  }

  get goodCount(): number {
    return this._goodCount;
  }

  get easyCount(): number {
    return this._easyCount;
  }

  get status(): StudySessionStatus {
    return this._status;
  }

  get startedAt(): Date {
    return this._startedAt;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get abandonedAt(): Date | null {
    return this._abandonedAt;
  }

  get isInProgress(): boolean {
    return this._status === 'IN_PROGRESS';
  }

  static create(props: {
    userId: string;
    tenantId: string;
    scope: StudySessionScope;
    topicId: string | null;
    studyType?: StudySessionType;
    enrolledCardIds: string[];
  }): StudySession {
    const now = new Date();
    const session = new StudySession({
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    });

    session._userId = props.userId;
    session._tenantId = props.tenantId;
    session._scope = props.scope;
    session._studyType = props.studyType ?? 'FLASHCARD';
    session._topicId = props.topicId;
    session._enrolledCardIds = [...new Set(props.enrolledCardIds)];
    session._reviewedCount = 0;
    session._againCount = 0;
    session._hardCount = 0;
    session._goodCount = 0;
    session._easyCount = 0;
    session._status = 'IN_PROGRESS';
    session._startedAt = now;
    session._completedAt = null;
    session._abandonedAt = null;

    session.addEvent(
      new StudySessionStartedEvent({
        aggregateId: session.id,
        sessionId: session.id,
        userId: session._userId,
        tenantId: session._tenantId,
        scope: session._scope,
        studyType: session._studyType,
        topicId: session._topicId,
        enrolledCardCount: session._enrolledCardIds.length,
      }),
    );

    return session;
  }

  static rehydrate(props: {
    id: string;
    userId: string;
    tenantId: string;
    scope: StudySessionScope;
    studyType: StudySessionType;
    topicId: string | null;
    enrolledCardIds: string[];
    reviewedCount: number;
    againCount: number;
    hardCount: number;
    goodCount: number;
    easyCount: number;
    status: StudySessionStatus;
    startedAt: Date;
    completedAt: Date | null;
    abandonedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): StudySession {
    const session = new StudySession({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    session._userId = props.userId;
    session._tenantId = props.tenantId;
    session._scope = props.scope;
    session._studyType = props.studyType;
    session._topicId = props.topicId;
    session._enrolledCardIds = props.enrolledCardIds;
    session._reviewedCount = props.reviewedCount;
    session._againCount = props.againCount;
    session._hardCount = props.hardCount;
    session._goodCount = props.goodCount;
    session._easyCount = props.easyCount;
    session._status = props.status;
    session._startedAt = props.startedAt;
    session._completedAt = props.completedAt;
    session._abandonedAt = props.abandonedAt;

    return session;
  }

  includesCard(wordSenseId: string): boolean {
    return this._enrolledCardIds.includes(wordSenseId);
  }

  recordReview(rating: 1 | 2 | 3 | 4): void {
    this._reviewedCount += 1;

    if (rating === 1) this._againCount += 1;
    if (rating === 2) this._hardCount += 1;
    if (rating === 3) this._goodCount += 1;
    if (rating === 4) this._easyCount += 1;

    this.updateUpdatedAt();
  }

  complete(now: Date = new Date()): void {
    this._status = 'COMPLETED';
    this._completedAt = now;
    this._abandonedAt = null;
    this.updateUpdatedAt();

    this.addEvent(
      new StudySessionCompletedEvent({
        aggregateId: this.id,
        sessionId: this.id,
        userId: this._userId,
        tenantId: this._tenantId,
        reviewedCount: this._reviewedCount,
        againCount: this._againCount,
        hardCount: this._hardCount,
        goodCount: this._goodCount,
        easyCount: this._easyCount,
        completedAt: now,
      }),
    );
  }
}
