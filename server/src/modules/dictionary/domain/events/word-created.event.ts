import { DomainEvent, DomainEventProps } from '@core/ddd';
import { Word } from '../entities/word.aggregate';

export class WordCreatedEvent extends DomainEvent {
  public readonly word: Word;
  public readonly tenantId: string;

  constructor(props: DomainEventProps<WordCreatedEvent>) {
    super(props);
    this.word = props.word;
    this.tenantId = props.tenantId;
  }
}
