import { DomainEvent, DomainEventProps } from '@core/ddd';
import { WordSnapshot } from '../value-objects/word-snapshot.vo';

export class WordEnrichedEvent extends DomainEvent {
  public readonly snapshot: WordSnapshot;
  public readonly tenantId: string;

  constructor(props: DomainEventProps<WordEnrichedEvent>) {
    super(props);
    this.snapshot = props.snapshot;
    this.tenantId = props.tenantId;
  }
}
