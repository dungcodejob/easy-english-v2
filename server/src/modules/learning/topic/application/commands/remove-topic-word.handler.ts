import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import { RemoveTopicWordCommand } from './remove-topic-word.command';
import {
  InjectTopicRepository,
  type ITopicRepository,
} from '../../domain/repositories/topic.repository.interface';

/**
 * Remove Topic Word Command Handler
 *
 * Business logic layer - handles removing a word from a topic.
 * Validates topic ownership before removal.
 */
@CommandHandler(RemoveTopicWordCommand)
export class RemoveTopicWordHandler implements ICommandHandler<
  RemoveTopicWordCommand,
  void
> {
  private readonly logger = new Logger(RemoveTopicWordHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectTopicRepository()
    private readonly repo: ITopicRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RemoveTopicWordCommand): Promise<void> {
    const topic = await this.repo.findById(
      command.topicId,
      command.tenantId,
      command.userId,
    );

    if (!topic) {
      throw new NotFoundException('Topic not found or access denied');
    }

    const result = topic.removeWord(command.wordSenseId);

    if (result.isErr()) {
      throw new NotFoundException('Word not found in this topic');
    }

    this.repo.persist(topic);
    await this.em.flush();
    topic.publishEvents(this.logger, this.eventBus);
  }
}
