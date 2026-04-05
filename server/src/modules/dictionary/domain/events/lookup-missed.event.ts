import { DomainEvent, type DomainEventProps } from '@core/ddd';

export class LookupMissedEvent extends DomainEvent {
  public readonly word: string;
  public readonly tenantId: string;
  public readonly userId: string;

  constructor(props: DomainEventProps<LookupMissedEvent>) {
    super(props);
    this.word = props.word;
    this.tenantId = props.tenantId;
    this.userId = props.userId;
  }
}
