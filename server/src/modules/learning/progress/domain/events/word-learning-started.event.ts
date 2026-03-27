import { DomainEvent, type DomainEventProps } from '@core/ddd';

export interface WordLearningStartedEventPayload {
  userId: string;
  tenantId: string;
  wordSenseId: string;
}

export class WordLearningStartedEvent extends DomainEvent {
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly wordSenseId: string;

  constructor(props: DomainEventProps<WordLearningStartedEventPayload>) {
    super(props);
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.wordSenseId = props.wordSenseId;
  }
}
