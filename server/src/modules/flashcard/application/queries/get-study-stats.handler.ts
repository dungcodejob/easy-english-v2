import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import type { IStudyStatsRepository } from '../../domain/repositories/study-stats.repository.interface';
import { InjectStudyStatsRepository } from '../../domain/repositories/study-stats.repository.interface';
import { StudyStatsMapper } from '../../infrastructure/mappers/study-stats.mapper';
import { StudyStatsResponseDto } from '../../dto/responses/study-stats.response.dto';
import { GetStudyStatsQuery } from './get-study-stats.query';

/**
 * Get Study Stats Query Handler
 */
@Injectable()
@QueryHandler(GetStudyStatsQuery)
export class GetStudyStatsHandler implements IQueryHandler<
  GetStudyStatsQuery,
  StudyStatsResponseDto
> {
  constructor(
    @InjectStudyStatsRepository()
    private readonly statsRepo: IStudyStatsRepository,
    private readonly statsMapper: StudyStatsMapper,
  ) {}

  async execute(query: GetStudyStatsQuery): Promise<StudyStatsResponseDto> {
    const stats = await this.statsRepo.findByUserId(
      query.userId,
      query.tenantId,
    );
    return this.statsMapper.toResponse(stats!);
  }
}
