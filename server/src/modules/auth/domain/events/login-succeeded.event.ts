import { DomainEvent, DomainEventProps } from '@core/ddd';

export class LoginSucceededEvent extends DomainEvent {
  public readonly userId: string;
  public readonly sessionId: string;
  public readonly tenantId: string;

  constructor(props: DomainEventProps<LoginSucceededEvent>) {
    super(props);
    this.userId = props.userId;
    this.sessionId = props.sessionId;
    this.tenantId = props.tenantId;
  }
}
