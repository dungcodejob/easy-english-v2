import { DomainEvent, DomainEventProps } from '@core/ddd';

export class LookupSucceededEvent extends DomainEvent {
  public readonly words: string[];
  public readonly sources: string[];
  public readonly tenantId: string;
  public readonly userId: string;

  constructor(props: DomainEventProps<LookupSucceededEvent>) {
    super(props);
    this.words = props.words;
    this.sources = props.sources;
    this.tenantId = props.tenantId;
    this.userId = props.userId;
  }
}
