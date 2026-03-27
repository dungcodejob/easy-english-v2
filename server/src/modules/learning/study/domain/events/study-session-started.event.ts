import { DomainEvent, DomainEventProps } from '@core/ddd';
import {
  StudySessionScope,
  StudySessionType,
} from '../entities/study-session.entity';

export interface StudySessionStartedEventPayload {
  sessionId: string;
  userId: string;
  tenantId: string;
  scope: StudySessionScope;
  studyType: StudySessionType;
  topicId: string | null;
  enrolledCardCount: number;
}

export class StudySessionStartedEvent extends DomainEvent {
  public readonly sessionId: string;
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly scope: StudySessionScope;
  public readonly studyType: StudySessionType;
  public readonly topicId: string | null;
  public readonly enrolledCardCount: number;

  constructor(props: DomainEventProps<StudySessionStartedEventPayload>) {
    super(props);
    this.sessionId = props.sessionId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.scope = props.scope;
    this.studyType = props.studyType;
    this.topicId = props.topicId;
    this.enrolledCardCount = props.enrolledCardCount;
  }
}
