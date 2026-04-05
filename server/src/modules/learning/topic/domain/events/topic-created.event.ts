import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface TopicCreatedEventPayload {
  topic: unknown;
}

export class TopicCreatedEvent extends DomainEvent {
  public readonly topic: unknown;

  constructor(props: DomainEventProps<TopicCreatedEventPayload>) {
    super(props);
    this.topic = props.topic;
  }
}
