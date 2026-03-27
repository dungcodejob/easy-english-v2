import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import { DeleteTopicCommand } from './delete-topic.command';
import {
  InjectTopicRepository,
  type ITopicRepository,
} from '../../domain/repositories/topic.repository.interface';

/**
 * Delete Topic Command Handler
 *
 * Business logic layer - handles the delete topic use case.
 * Validates ownership before deletion (multi-tenant safety).
 * Cascade deletion of words is handled by MikroORM via cascade: [Cascade.ALL]
 * and orphanRemoval: true on the TopicOrmEntity's words collection.
 */
@CommandHandler(DeleteTopicCommand)
export class DeleteTopicHandler implements ICommandHandler<
  DeleteTopicCommand,
  void
> {
  private readonly logger = new Logger(DeleteTopicHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectTopicRepository()
    private readonly repo: ITopicRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteTopicCommand): Promise<void> {
    const topic = await this.repo.findById(
      command.topicId,
      command.tenantId,
      command.userId,
    );

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    topic.markDeleted();

    await this.repo.delete(command.topicId, command.tenantId, command.userId);
    await this.em.flush();
    topic.publishEvents(this.logger, this.eventBus);
  }
}
