import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface TopicDeletedEventPayload {
  topicId: string;
  userId: string;
  tenantId: string;
}

export class TopicDeletedEvent extends DomainEvent {
  public readonly topicId: string;
  public readonly userId: string;
  public readonly tenantId: string;

  constructor(props: DomainEventProps<TopicDeletedEventPayload>) {
    super(props);
    this.topicId = props.topicId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
  }
}
