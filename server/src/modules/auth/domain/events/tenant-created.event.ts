import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface TenantCreatedEventPayload {
  tenantId: string;
  name: string;
  plan: string;
  status: string;
}

export class TenantCreatedEvent extends DomainEvent {
  public readonly tenantId: string;
  public readonly name: string;
  public readonly plan: string;
  public readonly status: string;

  constructor(props: DomainEventProps<TenantCreatedEventPayload>) {
    super(props);
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.plan = props.plan;
    this.status = props.status;
  }
}
