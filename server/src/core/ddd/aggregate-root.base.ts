import { Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { RequestContextService } from '../context/request-context.service';
import { DomainEvent } from './domain-event.base';
import { Entity } from './entity.base';

export abstract class AggregateRoot extends Entity {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  publishEvents(logger: Logger, eventBus: EventBus): void {
    for (const event of this.domainEvents) {
      logger.debug(
        `[${RequestContextService.getRequestId()}] "${
          event.constructor.name
        }" event published for aggregate ${this.constructor.name} : ${this.id}`,
      );
      eventBus.publish(event);
    }
    this.clearEvents();
  }

  protected addEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }
}
