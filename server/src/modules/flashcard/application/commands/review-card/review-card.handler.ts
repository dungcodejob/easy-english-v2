import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import { ReviewCardCommand } from './review-card.command';
import {
  InjectLearningWriteRepository,
  type ILearningWriteRepository,
} from '../../../../learning/progress/domain/repositories/learning-write.repository.interface';
import { FsrsSchedulerService } from '../../../../learning/progress/domain/services/fsrs-scheduler.service';
import { ReviewLog } from '../../../domain/entities/review-log.entity';
import {
  InjectFlashcardRepository,
  type IFlashcardRepository,
} from '../../../domain/repositories/flashcard.repository.interface';
import {
  InjectReviewLogRepository,
  type IReviewLogRepository,
} from '../../../domain/repositories/review-log.repository.interface';
import { FlashcardId } from '../../../domain/value-objects/flashcard-id.vo';
import { ReviewRating } from '../../../domain/value-objects/review-rating.vo';
import { ReviewResultResponseDto } from '../../../dto/responses/review-result.response.dto';

@CommandHandler(ReviewCardCommand)
export class ReviewCardHandler implements ICommandHandler<
  ReviewCardCommand,
  ReviewResultResponseDto
> {
  private readonly logger = new Logger(ReviewCardHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectFlashcardRepository()
    private readonly flashcardRepo: IFlashcardRepository,
    @InjectReviewLogRepository()
    private readonly reviewLogRepo: IReviewLogRepository,
    @InjectLearningWriteRepository()
    private readonly progressWriteRepo: ILearningWriteRepository,
    private readonly fsrsService: FsrsSchedulerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReviewCardCommand): Promise<ReviewResultResponseDto> {
    const flashcard = await this.flashcardRepo.findById(command.cardId);

    if (
      flashcard?.userId !== command.userId ||
      flashcard.tenantId !== command.tenantId
    ) {
      throw new NotFoundException('Flashcard not found');
    }

    const now = new Date();
    const rating = ReviewRating.from(command.rating);

    // For dictionary-linked cards: update shared UserWordSenseProgress FSRS state
    if (flashcard.wordSenseId) {
      const progress = await this.progressWriteRepo.findOneByUserAndSense(
        command.userId,
        flashcard.wordSenseId,
      );

      if (!progress) {
        throw new NotFoundException(
          'Word not in learning list. Add it to your learning list first.',
        );
      }

      const previousParams = progress.fsrsParams;

      const newParams = this.fsrsService.calculateNext(
        previousParams,
        rating,
        now,
      );

      // Throws AlreadyArchivedException if archived — let it bubble up
      progress.applyReview(rating, newParams, command.reviewDurationMs);

      const reviewLog = ReviewLog.create({
        cardId: FlashcardId.from(flashcard.id),
        wordSenseId: flashcard.wordSenseId,
        userId: command.userId,
        tenantId: command.tenantId,
        rating,
        previousState: previousParams.state,
        newState: newParams.state,
        previousParams,
        newParams,
        reviewDurationMs: command.reviewDurationMs,
        reviewedAt: now,
      });

      await this.progressWriteRepo.save(progress);
      await this.reviewLogRepo.create(reviewLog);
      await this.em.flush();
      progress.publishEvents(this.logger, this.eventBus);

      const dueDate = newParams.dueDate ?? new Date();
      const intervalDays = Math.round(
        (dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
      );

      return {
        cardId: flashcard.id,
        newState: newParams.state.value,
        nextDueDate: dueDate.toISOString(),
        intervalDays,
        isMastered: newParams.isMastered,
      };
    }

    // Custom card — no UserWordSenseProgress to update
    flashcard.publishEvents(this.logger, this.eventBus);

    return {
      cardId: flashcard.id,
      newState: 'new',
      nextDueDate: now.toISOString(),
      intervalDays: 0,
      isMastered: false,
    };
  }
}
