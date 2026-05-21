import { type Mapper } from '@core/ddd';

import { StudyStats } from '../../domain/entities/study-stats.aggregate';
import { type StudyStatsResponseDto } from '../../dto/responses/study-stats.response.dto';
import { StudyStatsOrmEntity } from '../persistence/study-stats.orm-entity';

export class StudyStatsMapper implements Mapper<
  StudyStats,
  StudyStatsOrmEntity,
  StudyStatsResponseDto
> {
  toDomain(orm: StudyStatsOrmEntity): StudyStats {
    return StudyStats.rehydrate({
      id: orm.id,
      props: {
        tenantId: orm.tenantId,
        userId: orm.userId,
        currentStreak: orm.currentStreak,
        longestStreak: orm.longestStreak,
        totalCardsReviewed: orm.totalCardsReviewed,
        totalStudyTimeMinutes: orm.totalStudyTimeMinutes,
        masteredCards: orm.masteredCards,
        lastStudyDate: orm.lastStudyDate ?? null,
      },
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  toPersistence(domain: StudyStats): StudyStatsOrmEntity {
    const orm = new StudyStatsOrmEntity(domain.tenantId, domain.userId);

    orm.id = domain.id;
    orm.currentStreak = domain.currentStreak;
    orm.longestStreak = domain.longestStreak;
    orm.totalCardsReviewed = domain.totalCardsReviewed;
    orm.totalStudyTimeMinutes = domain.totalStudyTimeMinutes;
    orm.masteredCards = domain.masteredCards;
    orm.lastStudyDate = domain.lastStudyDate ?? undefined;

    return orm;
  }

  toResponse(domain: StudyStats): StudyStatsResponseDto {
    return {
      streak: domain.currentStreak,
      totalCardsReviewed: domain.totalCardsReviewed,
      totalStudyTimeMinutes:
        Math.round(domain.totalStudyTimeMinutes * 100) / 100,
      masteredCards: domain.masteredCards,
      lastStudyDate: domain.lastStudyDate?.toISOString(),
    };
  }
}
