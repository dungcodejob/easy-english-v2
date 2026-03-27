import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface FlashcardUpdatedEventPayload {
  flashcard: unknown;
}

export class FlashcardUpdatedEvent extends DomainEvent {
  public readonly flashcard: unknown;

  constructor(props: DomainEventProps<FlashcardUpdatedEventPayload>) {
    super(props);
    this.flashcard = props.flashcard;
  }
}
