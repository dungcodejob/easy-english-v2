import { DomainEvent, DomainEventProps } from '@core/ddd';

export class LookupSucceededEvent extends DomainEvent {
  public readonly word: string;
  public readonly source: string;
  public readonly tenantId: string;
  public readonly userId: string;

  constructor(props: DomainEventProps<LookupSucceededEvent>) {
    super(props);
    this.word = props.word;
    this.source = props.source;
    this.tenantId = props.tenantId;
    this.userId = props.userId;
  }
}
