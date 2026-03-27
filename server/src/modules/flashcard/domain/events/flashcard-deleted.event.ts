import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface FlashcardDeletedEventPayload {
  flashcardId: string;
  userId: string;
  tenantId: string;
}

export class FlashcardDeletedEvent extends DomainEvent {
  public readonly flashcardId: string;
  public readonly userId: string;
  public readonly tenantId: string;

  constructor(props: DomainEventProps<FlashcardDeletedEventPayload>) {
    super(props);
    this.flashcardId = props.flashcardId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
  }
}
