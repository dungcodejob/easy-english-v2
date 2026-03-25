import { Mapper } from '@core/ddd';
import { UserWordSenseProgress } from '../../domain/entities/user-word-sense-progress.entity';
import { CardState } from '../../domain/value-objects/card-state.vo';
import { FsrsParameters } from '../../domain/value-objects/fsrs-parameters.vo';
import { UserWordSenseProgressOrmEntity } from '../persistence/user-word-sense-progress.orm-entity';

export class UserWordSenseProgressMapper implements Mapper<
  UserWordSenseProgress,
  UserWordSenseProgressOrmEntity,
  object
> {
  toDomain(ormEntity: UserWordSenseProgressOrmEntity): UserWordSenseProgress {
    const fsrsParams = new FsrsParameters({
      stability: ormEntity.stability,
      difficulty: ormEntity.difficulty,
      lapses: ormEntity.lapses,
      reps: ormEntity.reps,
      state: CardState.from(ormEntity.state),
      dueDate: ormEntity.dueDate,
      lastReviewDate: ormEntity.lastReviewDate,
    });

    return UserWordSenseProgress.rehydrate({
      id: ormEntity.id,
      userId: ormEntity.userId,
      wordSenseId: ormEntity.wordSense.id,
      fsrsParams,
      tenantId: ormEntity.tenantId,
      // Legacy fields — read from ORM during transition period
      masteryLevel: ormEntity.masteryLevel,
      reviewCount: ormEntity.reviewCount,
      nextReviewAt: ormEntity.nextReviewAt,
      lastReviewedAt: ormEntity.lastReviewedAt,
      archivedAt: ormEntity.archivedAt,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  toPersistence(domain: UserWordSenseProgress): UserWordSenseProgressOrmEntity {
    const orm = new UserWordSenseProgressOrmEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    // wordSense FK is set by the repository layer (see LearningWriteRepository)
    orm.stability = domain.fsrsParams.stability;
    orm.difficulty = domain.fsrsParams.difficulty;
    orm.lapses = domain.fsrsParams.lapses;
    orm.reps = domain.fsrsParams.reps;
    orm.state = domain.fsrsParams.state.value;
    orm.dueDate = domain.fsrsParams.dueDate;
    orm.lastReviewDate = domain.fsrsParams.lastReviewDate;
    // Legacy fields — synced by domain on each applyReview()
    orm.masteryLevel = domain.masteryLevel;
    orm.reviewCount = domain.reviewCount;
    orm.nextReviewAt = domain.nextReviewAt;
    orm.lastReviewedAt = domain.lastReviewedAt;
    orm.archivedAt = domain.archivedAt;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  toResponse(domain: UserWordSenseProgress): object {
    const params = domain.fsrsParams;
    // Derive legacy fields from fsrsParams for backward-compatible API response
    const masteryLevel = Math.min(100, Math.round(params.stability * 3));
    const reviewCount = domain.reviewCount;
    const nextReviewAt =
      params.dueDate !== null ? params.dueDate.toISOString() : null;
    const lastReviewedAt =
      params.lastReviewDate !== null
        ? params.lastReviewDate.toISOString()
        : null;

    return {
      id: domain.id,
      wordSenseId: domain.wordSenseId,
      masteryLevel,
      reviewCount,
      nextReviewAt,
      lastReviewedAt,
      isDue: domain.isDue,
      isMastered: domain.isMastered,
      fsrsState: params.state.value,
      createdAt: domain.createdAt.toISOString(),
    };
  }
}
