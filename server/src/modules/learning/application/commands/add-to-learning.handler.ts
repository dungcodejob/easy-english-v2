import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserWordSenseProgress } from '../../domain/entities/user-word-sense-progress.entity';
import type { ILearningRepository } from '../../domain/repositories/learning.repository.interface';
import { InjectLearningRepository } from '../../domain/repositories/learning.repository.interface';
import { AddToLearningCommand } from './add-to-learning.command';

@CommandHandler(AddToLearningCommand)
export class AddToLearningHandler implements ICommandHandler<AddToLearningCommand> {
  private readonly logger = new Logger(AddToLearningHandler.name);

  constructor(
    @InjectLearningRepository()
    private readonly learningRepo: ILearningRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: AddToLearningCommand,
  ): Promise<{ id: string; alreadyLearning: boolean }> {
    const existing = await this.learningRepo.findOneByUserAndSense(
      command.userId,
      command.wordSenseId,
    );

    if (existing) {
      if (existing.isArchived) {
        existing.restore();
        await this.learningRepo.save(existing);
        existing.publishEvents(this.logger, this.eventBus);
        return { id: existing.id, alreadyLearning: false };
      }
      return { id: existing.id, alreadyLearning: true };
    }

    const progress = UserWordSenseProgress.create({
      userId: command.userId,
      wordSenseId: command.wordSenseId,
    });

    await this.learningRepo.save(progress);
    progress.publishEvents(this.logger, this.eventBus);

    return { id: progress.id, alreadyLearning: false };
  }
}
