import { DomainEvent, DomainEventProps } from '@core/ddd';

export interface WordLearningRemovedEventPayload {
  userId: string;
  tenantId: string;
  wordSenseId: string;
}

export class WordLearningRemovedEvent extends DomainEvent {
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly wordSenseId: string;

  constructor(props: DomainEventProps<WordLearningRemovedEventPayload>) {
    super(props);
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.wordSenseId = props.wordSenseId;
  }
}
