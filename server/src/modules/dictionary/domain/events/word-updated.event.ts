import { DomainEvent, DomainEventProps } from '@core/ddd';
import { Word } from '../entities/word.aggregate';

export class WordUpdatedEvent extends DomainEvent {
  public readonly word: Word;
  public readonly previousVersion: number;
  public readonly tenantId: string;

  constructor(props: DomainEventProps<WordUpdatedEvent>) {
    super(props);
    this.word = props.word;
    this.previousVersion = props.previousVersion;
    this.tenantId = props.tenantId;
  }
}
