import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiResponse as ApiResponseBuilder } from '@core/api';

import { CurrentUser } from '@shared/decorators';

import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';

import { ReviewCardCommand } from '../application/commands/review-card/review-card.command';
import { GetDueCardsQuery } from '../application/queries/get-due-cards.query';
import { GetStudyStatsQuery } from '../application/queries/get-study-stats.query';
import { ReviewCardRequestDto } from '../dto/requests/review-card.request.dto';
import { DueCardResponseDto } from '../dto/responses/due-card.response.dto';
import { ReviewResultResponseDto } from '../dto/responses/review-result.response.dto';
import { StudyStatsResponseDto } from '../dto/responses/study-stats.response.dto';

import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';

@ApiTags('Study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'study' })
export class StudyController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get study statistics' })
  @ApiResponse({ type: StudyStatsResponseDto })
  async getStats(@CurrentUser() user: ITokenPayload) {
    const query = new GetStudyStatsQuery(user.userId, user.tenantId);
    const stats = await this.queryBus.execute<
      GetStudyStatsQuery,
      StudyStatsResponseDto
    >(query);

    return ApiResponseBuilder.success(stats);
  }

  @Get('due')
  @ApiOperation({ summary: 'Get cards due for review' })
  async getDueCards(
    @CurrentUser() user: ITokenPayload,
    @Query('limit') limit?: number,
  ) {
    const query = new GetDueCardsQuery(user.userId, user.tenantId, limit);
    const cards = await this.queryBus.execute<
      GetDueCardsQuery,
      DueCardResponseDto[]
    >(query);

    return ApiResponseBuilder.success(cards);
  }

  @Post('review')
  @ApiOperation({ summary: 'Review a flashcard' })
  @ApiResponse({ status: 201, type: ReviewResultResponseDto })
  async reviewCard(
    @Body() dto: ReviewCardRequestDto,
    @CurrentUser() user: ITokenPayload,
    @Query('cardId') cardId: string,
  ) {
    // ReviewCardCommand will be created in Chunk 5 — using cast for now
    const command: ReviewCardCommand = {
      cardId,
      userId: user.userId,
      tenantId: user.tenantId,
      rating: dto.rating,
      reviewDurationMs: dto.reviewDurationMs,
    };

    const result = await this.commandBus.execute<
      ReviewCardCommand,
      ReviewResultResponseDto
    >(command);

    return ApiResponseBuilder.success(result);
  }
}
