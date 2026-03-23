import { DomainEvent, DomainEventProps } from '@core/ddd';

export interface FlashcardCreatedEventPayload {
  flashcard: any;
}

export class FlashcardCreatedEvent extends DomainEvent {
  public readonly flashcard: unknown;

  constructor(props: DomainEventProps<FlashcardCreatedEventPayload>) {
    super(props);
    this.flashcard = props.flashcard;
  }
}
