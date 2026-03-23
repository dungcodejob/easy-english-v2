import { EntityManager } from '@mikro-orm/postgresql';
import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReviewLog } from '../../../domain/entities/review-log.entity';
import {
  InjectFlashcardRepository,
  type IFlashcardRepository,
} from '../../../domain/repositories/flashcard.repository.interface';
import {
  InjectReviewLogRepository,
  type IReviewLogRepository,
} from '../../../domain/repositories/review-log.repository.interface';
import { FsrsSchedulerService } from '../../../domain/services/fsrs-scheduler.service';
import { FlashcardId } from '../../../domain/value-objects/flashcard-id.vo';
import { ReviewRating } from '../../../domain/value-objects/review-rating.vo';
import { ReviewResultResponseDto } from '../../../dto/responses/review-result.response.dto';
import { ReviewCardCommand } from './review-card.command';

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
    private readonly fsrsService: FsrsSchedulerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReviewCardCommand): Promise<ReviewResultResponseDto> {
    const flashcard = await this.flashcardRepo.findById(command.cardId);
    if (
      !flashcard ||
      flashcard.userId !== command.userId ||
      flashcard.tenantId !== command.tenantId
    ) {
      throw new NotFoundException('Flashcard not found');
    }

    const now = new Date();
    const rating = ReviewRating.from(command.rating);
    const previousParams = flashcard.schedulingState;

    const newParams = this.fsrsService.calculateNext(
      previousParams,
      rating,
      now,
    );

    flashcard.review(rating, newParams, command.reviewDurationMs);

    const reviewLog = ReviewLog.create({
      cardId: FlashcardId.from(flashcard.id),
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

    await this.flashcardRepo.persist(flashcard);
    await this.reviewLogRepo.create(reviewLog);
    await this.em.flush();
    flashcard.publishEvents(this.logger, this.eventBus);

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
}
