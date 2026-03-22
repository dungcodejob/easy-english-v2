import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ApiResponse as ApiResponseBuilder } from '@core/api';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { GetDueCardsQuery } from '../application/queries/get-due-cards.query';
import { GetStudyStatsQuery } from '../application/queries/get-study-stats.query';
import { StudyStatsResponseDto } from '../dto/responses/study-stats.response.dto';

@ApiTags('Study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'study' })
export class StudyController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get study statistics' })
  @ApiResponse({ type: StudyStatsResponseDto })
  async getStats(@CurrentUser() user: ITokenPayload) {
    const query = new GetStudyStatsQuery(user.userId, user.tenantId);
    const stats = await this.queryBus.execute<GetStudyStatsQuery, StudyStatsResponseDto>(query);
    return ApiResponseBuilder.success(stats);
  }

  @Get('due')
  @ApiOperation({ summary: 'Get cards due for review' })
  async getDueCards(
    @CurrentUser() user: ITokenPayload,
    @Query('limit') limit?: number,
  ) {
    const query = new GetDueCardsQuery(user.userId, user.tenantId, limit);
    const cards = await this.queryBus.execute<GetDueCardsQuery, any[]>(query);
    return ApiResponseBuilder.success(cards);
  }
}
