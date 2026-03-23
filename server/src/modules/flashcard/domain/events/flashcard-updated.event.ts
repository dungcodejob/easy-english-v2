import { DomainEvent, DomainEventProps } from '@core/ddd';

export interface FlashcardUpdatedEventPayload {
  flashcard: any;
}

export class FlashcardUpdatedEvent extends DomainEvent {
  public readonly flashcard: unknown;

  constructor(props: DomainEventProps<FlashcardUpdatedEventPayload>) {
    super(props);
    this.flashcard = props.flashcard;
  }
}
