import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import type { ILearningWriteRepository } from '../../domain/repositories/learning-write.repository.interface';
import { InjectLearningWriteRepository } from '../../domain/repositories/learning-write.repository.interface';
import { RemoveFromLearningCommand } from './remove-from-learning.command';

@CommandHandler(RemoveFromLearningCommand)
export class RemoveFromLearningHandler implements ICommandHandler<RemoveFromLearningCommand> {
  private readonly logger = new Logger(RemoveFromLearningHandler.name);

  constructor(
    @InjectLearningWriteRepository()
    private readonly learningRepo: ILearningWriteRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: RemoveFromLearningCommand,
  ): Promise<{ success: boolean; wasLearning: boolean }> {
    const progress = await this.learningRepo.findOneByUserAndSense(
      command.userId,
      command.wordSenseId,
    );

    if (!progress || progress.isArchived) {
      return { success: true, wasLearning: false };
    }

    progress.archive();
    await this.learningRepo.save(progress);
    progress.publishEvents(this.logger, this.eventBus);

    return { success: true, wasLearning: true };
  }
}
