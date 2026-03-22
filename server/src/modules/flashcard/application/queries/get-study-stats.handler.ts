import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  type IStudyStatsRepository,
  InjectStudyStatsRepository,
} from '../../domain/repositories/study-stats.repository.interface';
import { StudyStatsResponseDto } from '../../dto/responses/study-stats.response.dto';
import { StudyStatsOrmEntity } from '../../infrastructure/persistence/study-stats.orm-entity';
import { GetStudyStatsQuery } from './get-study-stats.query';

@QueryHandler(GetStudyStatsQuery)
export class GetStudyStatsHandler implements IQueryHandler<GetStudyStatsQuery> {
  constructor(
    @InjectStudyStatsRepository()
    private readonly statsRepo: IStudyStatsRepository,
  ) {}

  async execute(query: GetStudyStatsQuery): Promise<StudyStatsResponseDto> {
    let stats = await this.statsRepo.findByUserId(query.userId, query.tenantId);

    if (!stats) {
      stats = await this.statsRepo.create(
        new StudyStatsOrmEntity(query.tenantId, query.userId),
      );
    }

    return {
      streak: stats.streak,
      totalCardsReviewed: stats.totalCardsReviewed,
      totalStudyTimeMinutes: stats.totalStudyTimeMinutes,
      masteredCards: stats.masteredCards,
      lastStudyDate: stats.lastStudyDate?.toISOString(),
    };
  }
}
