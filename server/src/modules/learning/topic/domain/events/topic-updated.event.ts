import { DomainEvent, DomainEventProps } from '@core/ddd';

export interface TopicUpdatedEventPayload {
  topic: unknown;
}

export class TopicUpdatedEvent extends DomainEvent {
  public readonly topic: unknown;

  constructor(props: DomainEventProps<TopicUpdatedEventPayload>) {
    super(props);
    this.topic = props.topic;
  }
}
