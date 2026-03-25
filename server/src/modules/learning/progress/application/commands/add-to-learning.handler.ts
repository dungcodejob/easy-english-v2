import { EntityManager } from '@mikro-orm/postgresql';
import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserWordSenseProgress } from '../../domain/entities/user-word-sense-progress.entity';
import type { ILearningWriteRepository } from '../../domain/repositories/learning-write.repository.interface';
import { InjectLearningWriteRepository } from '../../domain/repositories/learning-write.repository.interface';
import { AddToLearningCommand } from './add-to-learning.command';

/**
 * Add To Learning Command Handler
 *
 * Adds a word sense to the user's learning list. If the word is already
 * archived, restores it; if already active, returns early.
 */
@CommandHandler(AddToLearningCommand)
export class AddToLearningHandler implements ICommandHandler<
  AddToLearningCommand,
  { id: string; alreadyLearning: boolean }
> {
  private readonly logger = new Logger(AddToLearningHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectLearningWriteRepository()
    private readonly writeRepo: ILearningWriteRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: AddToLearningCommand,
  ): Promise<{ id: string; alreadyLearning: boolean }> {
    this.logger.debug(
      `Adding word sense ${command.wordSenseId} to learning list for user ${command.userId}`,
    );

    const existing = await this.writeRepo.findOneByUserAndSense(
      command.userId,
      command.wordSenseId,
    );

    if (existing) {
      if (existing.isArchived) {
        this.logger.debug(`Restoring archived progress ${existing.id}`);
        existing.restore();
        await this.writeRepo.save(existing);
        await this.em.flush();
        existing.publishEvents(this.logger, this.eventBus);
        return { id: existing.id, alreadyLearning: false };
      }
      this.logger.debug(`Word sense already in learning list: ${existing.id}`);
      return { id: existing.id, alreadyLearning: true };
    }

    const progress = UserWordSenseProgress.create({
      userId: command.userId,
      tenantId: command.tenantId,
      wordSenseId: command.wordSenseId,
    });

    await this.writeRepo.save(progress);
    await this.em.flush();
    progress.publishEvents(this.logger, this.eventBus);

    this.logger.log(
      `Created new progress ${progress.id} for user ${command.userId}`,
    );
    return { id: progress.id, alreadyLearning: false };
  }
}
