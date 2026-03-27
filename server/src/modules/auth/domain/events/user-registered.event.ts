import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface UserRegisteredEventPayload {
  userId: string;
  email: string;
  tenantId: string;
  name: string;
}

export class UserRegisteredEvent extends DomainEvent {
  public readonly userId: string;
  public readonly email: string;
  public readonly tenantId: string;
  public readonly name: string;

  constructor(props: DomainEventProps<UserRegisteredEventPayload>) {
    super(props);
    this.userId = props.userId;
    this.email = props.email;
    this.tenantId = props.tenantId;
    this.name = props.name;
  }
}
