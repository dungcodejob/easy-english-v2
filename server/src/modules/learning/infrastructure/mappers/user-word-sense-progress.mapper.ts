import { UserWordSenseProgress } from '../../domain/entities/user-word-sense-progress.entity';
import { UserWordSenseProgressOrmEntity } from '../persistence/user-word-sense-progress.orm-entity';

export class UserWordSenseProgressMapper {
  static toDomain(
    ormEntity: UserWordSenseProgressOrmEntity,
  ): UserWordSenseProgress {
    return UserWordSenseProgress.rehydrate({
      id: ormEntity.id,
      userId: ormEntity.userId,
      wordSenseId: ormEntity.wordSense.id,
      masteryLevel: ormEntity.masteryLevel,
      reviewCount: ormEntity.reviewCount,
      nextReviewAt: ormEntity.nextReviewAt,
      lastReviewedAt: ormEntity.lastReviewedAt,
      archivedAt: ormEntity.archivedAt,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }
}
