import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LookupMissedEvent } from '../../domain/events/lookup-missed.event';

@EventsHandler(LookupMissedEvent)
export class LookupMissedHandler implements IEventHandler<LookupMissedEvent> {
  private readonly logger = new Logger(LookupMissedHandler.name);

  handle(event: LookupMissedEvent) {
    this.logger.log(`Lookup missed for word: ${event.word}`);
    // Future: trigger async enrichment or import flow
  }
}
