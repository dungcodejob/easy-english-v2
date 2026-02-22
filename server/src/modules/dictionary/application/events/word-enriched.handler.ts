import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WordEnrichedEvent } from '../../domain/events/word-enriched.event';
import {
  InjectWordWriteRepository,
  type IWordWriteRepository,
} from '../../domain/repositories/word-write.repository.interface';

@EventsHandler(WordEnrichedEvent)
@Injectable()
export class WordEnrichedHandler implements IEventHandler<WordEnrichedEvent> {
  private readonly logger = new Logger(WordEnrichedHandler.name);

  constructor(
    @InjectWordWriteRepository()
    private readonly writeRepo: IWordWriteRepository,
  ) {}

  async handle(event: WordEnrichedEvent) {
    try {
      this.logger.log(
        `Persisting enriched word: ${event.snapshot.normalizedText}`,
      );
      await this.writeRepo.save(event.snapshot, event.tenantId);
    } catch (error) {
      this.logger.error(
        `Failed to persist enriched word ${event.snapshot.normalizedText}: ${error}`,
      );
    }
  }
}
