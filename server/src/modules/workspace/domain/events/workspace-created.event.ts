import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface WorkspaceCreatedEventPayload {
  workspaceId: string;
  userId: string;
  tenantId: string;
}

export class WorkspaceCreatedEvent extends DomainEvent {
  public readonly workspaceId: string;
  public readonly userId: string;
  public readonly tenantId: string;

  constructor(props: DomainEventProps<WorkspaceCreatedEventPayload>) {
    super(props);
    this.workspaceId = props.workspaceId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
  }
}
