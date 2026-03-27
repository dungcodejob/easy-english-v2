import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface WordMasteredEventPayload {
  userId: string;
  tenantId: string;
  wordSenseId: string;
}

export class WordMasteredEvent extends DomainEvent {
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly wordSenseId: string;

  constructor(props: DomainEventProps<WordMasteredEventPayload>) {
    super(props);
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.wordSenseId = props.wordSenseId;
  }
}
