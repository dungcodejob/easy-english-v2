import { DomainEvent, DomainEventProps } from '@core/ddd';

export interface StudySessionCompletedEventPayload {
  sessionId: string;
  userId: string;
  tenantId: string;
  reviewedCount: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  completedAt: Date;
}

export class StudySessionCompletedEvent extends DomainEvent {
  public readonly sessionId: string;
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly reviewedCount: number;
  public readonly againCount: number;
  public readonly hardCount: number;
  public readonly goodCount: number;
  public readonly easyCount: number;
  public readonly completedAt: Date;

  constructor(props: DomainEventProps<StudySessionCompletedEventPayload>) {
    super(props);
    this.sessionId = props.sessionId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.reviewedCount = props.reviewedCount;
    this.againCount = props.againCount;
    this.hardCount = props.hardCount;
    this.goodCount = props.goodCount;
    this.easyCount = props.easyCount;
    this.completedAt = props.completedAt;
  }
}
