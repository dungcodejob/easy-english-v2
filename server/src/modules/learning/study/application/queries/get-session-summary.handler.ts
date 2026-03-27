import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import { GetSessionSummaryQuery } from './get-session-summary.query';
import { SessionSummaryResponseDto } from '../../dto/responses/session-summary.response.dto';
import { StudyReviewLogOrmEntity } from '../../infrastructure/persistence/study-review-log.orm-entity';
import { StudySessionOrmEntity } from '../../infrastructure/persistence/study-session.orm-entity';

@QueryHandler(GetSessionSummaryQuery)
export class GetSessionSummaryHandler implements IQueryHandler<
  GetSessionSummaryQuery,
  SessionSummaryResponseDto
> {
  constructor(private readonly em: EntityManager) {}

  async execute(
    query: GetSessionSummaryQuery,
  ): Promise<SessionSummaryResponseDto> {
    const session = await this.em.findOne(StudySessionOrmEntity, {
      id: query.sessionId,
    });

    if (!session) {
      throw new NotFoundException('Study session not found');
    }

    if (
      session.userId !== query.userId ||
      session.tenantId !== query.tenantId
    ) {
      throw new NotFoundException('Study session not found');
    }

    const logs = await this.em.find<StudyReviewLogOrmEntity>(
      StudyReviewLogOrmEntity,
      { session: session.id },
    );

    const againCount = logs.filter((l) => l.rating === 1).length;
    const hardCount = logs.filter((l) => l.rating === 2).length;
    const goodCount = logs.filter((l) => l.rating === 3).length;
    const easyCount = logs.filter((l) => l.rating === 4).length;
    const reviewedCount = logs.length;

    const rawAccuracy =
      reviewedCount > 0 ? (goodCount + easyCount) / reviewedCount : 0;
    const accuracy = Math.round(rawAccuracy * 1000) / 10;

    const timeSpentMs = logs.reduce(
      (sum, log) => sum + log.reviewDurationMs,
      0,
    );

    return {
      sessionId: session.id,
      scope: session.scope,
      studyType: session.studyType,
      topicId: session.topicId,
      status: session.status,
      reviewedCount,
      enrolledCount: session.enrolledCardIds.length,
      ratingBreakdown: {
        again: againCount,
        hard: hardCount,
        good: goodCount,
        easy: easyCount,
      },
      accuracy,
      timeSpentMs,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
    };
  }
}
