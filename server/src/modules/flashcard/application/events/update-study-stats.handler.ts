import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { CardReviewedEvent } from '../../domain/events/card-reviewed.event';
import {
  type IStudyStatsRepository,
  InjectStudyStatsRepository,
} from '../../domain/repositories/study-stats.repository.interface';

@EventsHandler(CardReviewedEvent)
export class UpdateStudyStatsHandler {
  private readonly logger = new Logger(UpdateStudyStatsHandler.name);

  constructor(
    @InjectStudyStatsRepository()
    private readonly statsRepo: IStudyStatsRepository,
  ) {}

  async handle(event: CardReviewedEvent): Promise<void> {
    this.logger.debug(
      `Updating study stats for user ${event.userId}, card ${event.cardId}`,
    );

    const stats = await this.statsRepo.findOrCreate(event.userId, event.tenantId);
    stats.recordReview(event.rating, event.reviewDurationMs, event.newParams.isMastered);
    await this.statsRepo.persist(stats);

    this.logger.debug(
      `Study stats updated — streak: ${stats.currentStreak}, ` +
        `total reviewed: ${stats.totalCardsReviewed}`,
    );
  }
}
