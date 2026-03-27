import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface AuthIdentityCreatedEventPayload {
  authIdentityId: string;
  userId: string;
  provider: string;
  providerUserId: string;
}

export class AuthIdentityCreatedEvent extends DomainEvent {
  public readonly authIdentityId: string;
  public readonly userId: string;
  public readonly provider: string;
  public readonly providerUserId: string;

  constructor(props: DomainEventProps<AuthIdentityCreatedEventPayload>) {
    super(props);
    this.authIdentityId = props.authIdentityId;
    this.userId = props.userId;
    this.provider = props.provider;
    this.providerUserId = props.providerUserId;
  }
}
