import { Logger } from '@nestjs/common';
import { EventBus, EventsHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/core';

import { WordReviewedEvent } from '../../../learning/progress/domain/events/word-reviewed.event';
import {
  InjectStudyStatsRepository,
  type IStudyStatsRepository,
} from '../../domain/repositories/study-stats.repository.interface';

/**
 * Update Study Stats Event Handler
 *
 * Listens to WordReviewedEvent (emitted by UserWordSenseProgress.applyReview()).
 * Records the review in study statistics (streak, total reviews, mastery).
 */
@EventsHandler(WordReviewedEvent)
export class UpdateStudyStatsHandler {
  private readonly logger = new Logger(UpdateStudyStatsHandler.name);

  constructor(
    @InjectStudyStatsRepository()
    private readonly statsRepo: IStudyStatsRepository,

    private readonly em: EntityManager,
    private readonly eventBus: EventBus,
  ) {}

  async handle(event: WordReviewedEvent): Promise<void> {
    this.logger.debug(
      `Updating study stats for user ${event.userId}, word ${event.wordSenseId}`,
    );

    // Stats always exists (seeded on workspace creation)
    const stats = await this.statsRepo.findByUserId(
      event.userId,
      event.tenantId,
    );

    if (!stats) {
      this.logger.error(`StudyStats not found for user ${event.userId}`);

      return;
    }

    // Record the review (domain logic)
    stats.recordReview(
      event.rating,
      event.reviewDurationMs,
      event.newParams.isMastered,
    );

    // Persist changes
    await this.statsRepo.persist(stats);
    await this.em.flush();

    // Publish domain events
    stats.publishEvents(this.logger, this.eventBus);

    this.logger.debug(`Study stats updated for user ${event.userId}`);
  }
}
