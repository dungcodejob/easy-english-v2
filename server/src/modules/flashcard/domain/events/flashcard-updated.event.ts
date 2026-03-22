import { DomainEvent, DomainEventProps } from '@core/ddd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FlashcardUpdatedEventPayload { flashcard: any; }

export class FlashcardUpdatedEvent extends DomainEvent {
  public readonly flashcard: unknown;

  constructor(props: DomainEventProps<FlashcardUpdatedEventPayload>) {
    super(props);
    this.flashcard = props.flashcard;
  }
}
