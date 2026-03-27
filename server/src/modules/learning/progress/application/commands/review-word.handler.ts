import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import { ReviewWordCommand } from './review-word.command';
import { InjectLearningWriteRepository } from '../../domain/repositories/learning-write.repository.interface';
import { FsrsSchedulerService } from '../../domain/services/fsrs-scheduler.service';
import { ReviewRating } from '../../domain/value-objects/review-rating.vo';

import type { ILearningWriteRepository } from '../../domain/repositories/learning-write.repository.interface';

export interface ReviewWordResponse {
  wordSenseId: string;
  nextDueDate: string | null;
  intervalDays: number;
  isDue: boolean;
  isMastered: boolean;
}

@CommandHandler(ReviewWordCommand)
export class ReviewWordHandler implements ICommandHandler<
  ReviewWordCommand,
  ReviewWordResponse
> {
  private readonly logger = new Logger(ReviewWordHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectLearningWriteRepository()
    private readonly writeRepo: ILearningWriteRepository,
    private readonly fsrsService: FsrsSchedulerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReviewWordCommand): Promise<ReviewWordResponse> {
    this.logger.debug(
      `Reviewing word ${command.wordSenseId} for user ${command.userId} with rating ${command.rating}`,
    );

    const progress = await this.writeRepo.findOneByUserAndSense(
      command.userId,
      command.wordSenseId,
    );

    if (!progress) {
      throw new NotFoundException(
        'Word not found in learning list. Add it to your learning list first.',
      );
    }

    const now = new Date();
    const rating = ReviewRating.from(command.rating);
    const previousParams = progress.fsrsParams;

    const newParams = this.fsrsService.calculateNext(
      previousParams,
      rating,
      now,
    );

    // Throws AlreadyArchivedException if archived — let it bubble up
    progress.applyReview(
      rating,
      newParams,
      command.reviewDurationMs,
      command.sessionId,
    );

    await this.writeRepo.save(progress);
    await this.em.flush();
    progress.publishEvents(this.logger, this.eventBus);

    const dueDate = newParams.dueDate ?? new Date();
    const intervalDays = Math.round(
      (dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
    );

    return {
      wordSenseId: command.wordSenseId,
      nextDueDate: newParams.dueDate?.toISOString() ?? null,
      intervalDays,
      isDue: progress.isDue,
      isMastered: newParams.isMastered,
    };
  }
}
