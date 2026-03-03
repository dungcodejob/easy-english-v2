import { DomainEvent, DomainEventProps } from '@core/ddd';
import { Word } from '../entities/word.aggregate';

export class WordCreatedEvent extends DomainEvent {
  public readonly word: Word;

  constructor(props: DomainEventProps<WordCreatedEvent>) {
    super(props);
    this.word = props.word;
  }
}
