import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetStudyStatsQuery } from './get-study-stats.query';
import { InjectStudyStatsRepository } from '../../domain/repositories/study-stats.repository.interface';
import { StudyStatsResponseDto } from '../../dto/responses/study-stats.response.dto';
import { StudyStatsMapper } from '../../infrastructure/mappers/study-stats.mapper';

import type { IStudyStatsRepository } from '../../domain/repositories/study-stats.repository.interface';

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
