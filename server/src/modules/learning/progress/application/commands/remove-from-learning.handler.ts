import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import { RemoveFromLearningCommand } from './remove-from-learning.command';
import { InjectLearningWriteRepository } from '../../domain/repositories/learning-write.repository.interface';

import type { ILearningWriteRepository } from '../../domain/repositories/learning-write.repository.interface';

/**
 * Remove From Learning Command Handler
 *
 * Removes a word sense from the user's active learning list by archiving
 * its progress record. The domain method `archive()` is preserved.
 */
@CommandHandler(RemoveFromLearningCommand)
export class RemoveFromLearningHandler implements ICommandHandler<
  RemoveFromLearningCommand,
  { success: boolean; wasLearning: boolean }
> {
  private readonly logger = new Logger(RemoveFromLearningHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectLearningWriteRepository()
    private readonly writeRepo: ILearningWriteRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: RemoveFromLearningCommand,
  ): Promise<{ success: boolean; wasLearning: boolean }> {
    this.logger.debug(
      `Removing word sense ${command.wordSenseId} from learning list for user ${command.userId}`,
    );

    const progress = await this.writeRepo.findOneByUserAndSense(
      command.userId,
      command.wordSenseId,
    );

    if (!progress || progress.isArchived) {
      this.logger.debug(
        `No active progress found for word sense ${command.wordSenseId}`,
      );

      return { success: true, wasLearning: false };
    }

    // archive() is a domain method — preserves it
    progress.archive();
    await this.writeRepo.save(progress);
    await this.em.flush();
    progress.publishEvents(this.logger, this.eventBus);

    this.logger.log(
      `Archived progress ${progress.id} for user ${command.userId}`,
    );

    return { success: true, wasLearning: true };
  }
}
