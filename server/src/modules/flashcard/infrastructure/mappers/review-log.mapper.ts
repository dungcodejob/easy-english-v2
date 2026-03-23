import { Mapper } from '@core/ddd';
import { ReviewLog } from '../../domain/entities/review-log.entity';
import { ReviewLogOrmEntity } from '../persistence/review-log.orm-entity';
import { FlashcardId } from '../../domain/value-objects/flashcard-id.vo';
import { ReviewRating } from '../../domain/value-objects/review-rating.vo';
import { CardState } from '../../domain/value-objects/card-state.vo';
import { FsrsParameters } from '../../domain/value-objects/fsrs-parameters.vo';

export class ReviewLogMapper implements Mapper<ReviewLog, ReviewLogOrmEntity, object> {
  toDomain(orm: ReviewLogOrmEntity): ReviewLog {
    const previousParams = new FsrsParameters({
      stability: orm.previousStability,
      difficulty: orm.previousDifficulty,
      lapses: 0,
      reps: 0,
      state: CardState.from(orm.previousState),
      dueDate: null,
      lastReviewDate: null,
    });

    const newParams = new FsrsParameters({
      stability: orm.newStability,
      difficulty: orm.newDifficulty,
      lapses: 0,
      reps: 0,
      state: CardState.from(orm.newState),
      dueDate: null,
      lastReviewDate: null,
    });

    return ReviewLog.rehydrate({
      id: orm.id,
      props: {
        cardId: FlashcardId.from(orm.cardId),
        userId: orm.userId,
        tenantId: orm.tenantId,
        rating: ReviewRating.from(orm.rating),
        previousState: CardState.from(orm.previousState),
        newState: CardState.from(orm.newState),
        previousParams,
        newParams,
        reviewDurationMs: orm.reviewDurationMs,
        reviewedAt: orm.reviewedAt,
      },
      createdAt: orm.createdAt,
      updatedAt: orm.createdAt,
    });
  }

  toPersistence(domain: ReviewLog): ReviewLogOrmEntity {
    const orm = new ReviewLogOrmEntity();
    orm.id = domain.id;
    orm.cardId = domain.cardId.value;
    orm.userId = domain.userId;
    orm.tenantId = domain.tenantId;
    orm.rating = domain.rating.value;
    orm.previousState = domain.previousState.value;
    orm.newState = domain.newState.value;
    orm.previousStability = domain.previousStability;
    orm.newStability = domain.newStability;
    orm.previousDifficulty = domain.previousDifficulty;
    orm.newDifficulty = domain.newDifficulty;
    orm.reviewDurationMs = domain.reviewDurationMs;
    orm.reviewedAt = domain.reviewedAt;
    return orm;
  }

  toResponse(domain: ReviewLog): object {
    return {
      id: domain.id,
      cardId: domain.cardId.value,
      rating: domain.rating.value,
      previousState: domain.previousState.value,
      newState: domain.newState.value,
      reviewedAt: domain.reviewedAt.toISOString(),
    };
  }
}
