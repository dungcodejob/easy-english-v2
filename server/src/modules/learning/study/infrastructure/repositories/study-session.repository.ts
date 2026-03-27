import { Injectable } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';
import { WordSenseOrmEntity } from 'src/modules/dictionary/infrastructure/persistence/word-sense.orm-entity';

import { StudyReviewLog } from '../../domain/entities/study-review-log.entity';
import {
  StudySession,
  type StudySessionType,
} from '../../domain/entities/study-session.entity';
import { StudyReviewLogOrmEntity } from '../persistence/study-review-log.orm-entity';
import { StudySessionOrmEntity } from '../persistence/study-session.orm-entity';

@Injectable()
export class StudySessionRepository {
  constructor(private readonly em: EntityManager) {}

  async findSessionById(sessionId: string): Promise<StudySession | null> {
    const orm = await this.em.findOne(StudySessionOrmEntity, { id: sessionId });

    if (!orm) {
      return null;
    }

    return StudySession.rehydrate({
      id: orm.id,
      userId: orm.userId,
      tenantId: orm.tenantId,
      scope: orm.scope,
      studyType: orm.studyType as StudySessionType,
      topicId: orm.topicId,
      enrolledCardIds: orm.enrolledCardIds,
      reviewedCount: orm.reviewedCount,
      againCount: orm.againCount,
      hardCount: orm.hardCount,
      goodCount: orm.goodCount,
      easyCount: orm.easyCount,
      status: orm.status,
      startedAt: orm.startedAt,
      completedAt: orm.completedAt,
      abandonedAt: orm.abandonedAt,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  async saveSession(session: StudySession): Promise<void> {
    let orm = await this.em.findOne(StudySessionOrmEntity, { id: session.id });

    if (!orm) {
      orm = new StudySessionOrmEntity();
      orm.id = session.id;
    }

    orm.userId = session.userId;
    orm.tenantId = session.tenantId;
    orm.scope = session.scope;
    orm.studyType = session.studyType;
    orm.topicId = session.topicId;
    orm.enrolledCardIds = session.enrolledCardIds;
    orm.reviewedCount = session.reviewedCount;
    orm.againCount = session.againCount;
    orm.hardCount = session.hardCount;
    orm.goodCount = session.goodCount;
    orm.easyCount = session.easyCount;
    orm.status = session.status;
    orm.startedAt = session.startedAt;
    orm.completedAt = session.completedAt;
    orm.abandonedAt = session.abandonedAt;
    orm.createdAt = session.createdAt;
    orm.updatedAt = session.updatedAt;

    this.em.persist(orm);
  }

  async createReviewLog(reviewLog: StudyReviewLog): Promise<void> {
    const orm = new StudyReviewLogOrmEntity();

    orm.id = reviewLog.id;
    orm.session = this.em.getReference(
      StudySessionOrmEntity,
      reviewLog.sessionId,
    );
    orm.wordSense = this.em.getReference(
      WordSenseOrmEntity,
      reviewLog.wordSenseId,
    );
    orm.userId = reviewLog.userId;
    orm.tenantId = reviewLog.tenantId;
    orm.rating = reviewLog.rating;
    orm.reviewDurationMs = reviewLog.reviewDurationMs;
    orm.reviewedAt = reviewLog.reviewedAt;
    orm.createdAt = reviewLog.createdAt;

    this.em.persist(orm);
  }
}
