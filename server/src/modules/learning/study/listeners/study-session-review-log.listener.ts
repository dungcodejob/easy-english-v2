import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';
import { WordReviewedEvent } from 'src/modules/learning/progress/domain/events/word-reviewed.event';

import { StudyReviewLog } from '../domain/entities/study-review-log.entity';
import { StudySessionRepository } from '../infrastructure/repositories/study-session.repository';

interface PgErrorLike {
  code?: string;
}

@EventsHandler(WordReviewedEvent)
export class StudySessionReviewLogListener {
  private readonly logger = new Logger(StudySessionReviewLogListener.name);

  constructor(
    private readonly sessionRepository: StudySessionRepository,
    private readonly em: EntityManager,
  ) {}

  async handle(event: WordReviewedEvent): Promise<void> {
    if (!event.sessionId) {
      return;
    }

    const reviewLog = StudyReviewLog.create({
      sessionId: event.sessionId,
      userId: event.userId,
      tenantId: event.tenantId,
      wordSenseId: event.wordSenseId,
      rating: event.rating.value,
      reviewDurationMs: event.reviewDurationMs,
      reviewedAt: new Date(event.metadata.timestamp),
    });

    try {
      await this.sessionRepository.createReviewLog(reviewLog);
      await this.em.flush();
    } catch (error) {
      const pgError = error as PgErrorLike;

      if (pgError.code === '23505') {
        // Silently skip — another path already recorded this review log.
        // For an event handler, throwing would destabilize the event bus.
        this.logger.debug(
          `Skipping duplicate study review log for session ${event.sessionId} and word ${event.wordSenseId}`,
        );

        return;
      }
      throw error;
    }
  }
}
