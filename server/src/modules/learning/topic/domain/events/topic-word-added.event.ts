import { DomainEvent, DomainEventProps } from '@core/ddd';

export interface TopicWordAddedEventPayload {
  topicId: string;
  userId: string;
  tenantId: string;
  wordSenseId: string;
}

export class TopicWordAddedEvent extends DomainEvent {
  public readonly topicId: string;
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly wordSenseId: string;

  constructor(props: DomainEventProps<TopicWordAddedEventPayload>) {
    super(props);
    this.topicId = props.topicId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.wordSenseId = props.wordSenseId;
  }
}
