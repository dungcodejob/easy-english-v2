import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface TopicWordRemovedEventPayload {
  topicId: string;
  userId: string;
  tenantId: string;
  wordSenseId: string;
}

export class TopicWordRemovedEvent extends DomainEvent {
  public readonly topicId: string;
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly wordSenseId: string;

  constructor(props: DomainEventProps<TopicWordRemovedEventPayload>) {
    super(props);
    this.topicId = props.topicId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.wordSenseId = props.wordSenseId;
  }
}
