import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { WordCreatedEvent } from '../../domain/events/word-created.event';
import { WordUpdatedEvent } from '../../domain/events/word-updated.event';
import {
  InjectWordWriteRepository,
  type IWordWriteRepository,
} from '../../domain/repositories/word-write.repository.interface';

@EventsHandler(WordCreatedEvent, WordUpdatedEvent)
@Injectable()
export class WordPersistenceHandler implements IEventHandler<
  WordCreatedEvent | WordUpdatedEvent
> {
  private readonly logger = new Logger(WordPersistenceHandler.name);

  constructor(
    @InjectWordWriteRepository()
    private readonly writeRepo: IWordWriteRepository,
  ) {}

  async handle(event: WordCreatedEvent | WordUpdatedEvent) {
    try {
      const word = event.word;

      this.logger.log(
        `Persisting word aggregate: ${word.normalizedText.value}`,
      );
      await this.writeRepo.save(word);
    } catch (error) {
      const word = event.word;

      this.logger.error(
        `Failed to persist word ${word.normalizedText.value}: ${error}`,
      );
    }
  }
}
