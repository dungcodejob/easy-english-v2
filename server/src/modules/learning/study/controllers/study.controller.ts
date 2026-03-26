import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ApiResponse as ApiResponseBuilder } from '@core/api';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { GetDueCardsQuery } from '../application/queries/get-due-cards.query';
import { GetTopicCardsQuery } from '../application/queries/get-topic-cards.query';
import {
  StudyCardsEnvelopeDto,
  TopicStudyCardsEnvelopeDto,
} from '../dto/responses/study-card.response.dto';

@ApiTags('Learning Study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'learning/study' })
export class StudyController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('due')
  @ApiOperation({ summary: 'Get due study cards for current user' })
  @ApiResponse({
    status: 200,
    description: 'Due study cards retrieved successfully',
    type: StudyCardsEnvelopeDto,
  })
  async getDueCards(@CurrentUser() user: ITokenPayload) {
    const query = new GetDueCardsQuery(user.userId, user.tenantId);
    const result = await this.queryBus.execute<
      GetDueCardsQuery,
      StudyCardsEnvelopeDto
    >(query);

    return ApiResponseBuilder.success(result);
  }

  @Get('topic/:topicId')
  @ApiOperation({
    summary: 'Get study cards for a topic (phase 1: active progress only)',
  })
  @ApiParam({ name: 'topicId', description: 'Topic UUID' })
  @ApiResponse({
    status: 200,
    description: 'Topic study cards retrieved successfully',
    type: TopicStudyCardsEnvelopeDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid topicId format' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async getTopicCards(
    @Param('topicId') topicId: string,
    @CurrentUser() user: ITokenPayload,
  ) {
    const query = new GetTopicCardsQuery(user.userId, user.tenantId, topicId);
    const result = await this.queryBus.execute<
      GetTopicCardsQuery,
      TopicStudyCardsEnvelopeDto
    >(query);

    return ApiResponseBuilder.success(result);
  }
}
