import { DomainEvent, type DomainEventProps } from '@core/ddd';

import { type Word } from '../entities/word.aggregate';

export class WordUpdatedEvent extends DomainEvent {
  public readonly word: Word;
  public readonly previousVersion: number;
  constructor(props: DomainEventProps<WordUpdatedEvent>) {
    super(props);
    this.word = props.word;
    this.previousVersion = props.previousVersion;
  }
}
