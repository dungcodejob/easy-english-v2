import { DomainEvent, DomainEventProps } from '@core/ddd';

export class SessionCreatedEvent extends DomainEvent {
  public readonly sessionId: string;
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly expiresAt: Date;

  constructor(props: DomainEventProps<SessionCreatedEvent>) {
    super(props);
    this.sessionId = props.sessionId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.expiresAt = props.expiresAt;
  }
}
