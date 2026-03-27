import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ApiResponse } from '@core/api';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { StartStudySessionRequestDto } from '../dto/requests/start-study-session.request.dto';
import { CompleteStudySessionRequestDto } from '../dto/requests/complete-study-session.request.dto';
import { StudySessionReviewRequestDto } from '../dto/requests/study-session-review.request.dto';
import { SessionSummaryResponseDto } from '../dto/responses/session-summary.response.dto';
import { StartStudySessionResponse } from '../application/commands/start-study-session.handler';
import { CompleteStudySessionResponse } from '../application/commands/complete-study-session.handler';
import { ReviewWordResponse } from 'src/modules/learning/progress/application/commands/review-word.handler';
import { StartStudySessionCommand } from '../application/commands/start-study-session.command';
import { StudySessionReviewCommand } from '../application/commands/study-session-review.command';
import { CompleteStudySessionCommand } from '../application/commands/complete-study-session.command';
import { GetSessionSummaryQuery } from '../application/queries/get-session-summary.query';

@ApiTags('Learning Study Session')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'learning/study/session' })
export class StudySessionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new study session' })
  @SwaggerResponse({ status: 201, description: 'Session started', type: Object })
  async startSession(
    @Body() dto: StartStudySessionRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new StartStudySessionCommand(
      user.userId,
      user.tenantId,
      dto.scope,
      dto.topicId,
    );

    const result = await this.commandBus.execute<
      StartStudySessionCommand,
      StartStudySessionResponse
    >(command);

    return ApiResponse.success(result);
  }

  @Post('review')
  @ApiOperation({ summary: 'Review a card within an active study session' })
  @SwaggerResponse({ status: 201, description: 'Review recorded', type: Object })
  async reviewCard(
    @Body() dto: StudySessionReviewRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    // sessionId is passed in body by client; can also come from URL param if preferred
    const command = new StudySessionReviewCommand(
      dto.sessionId,
      dto.wordSenseId,
      user.userId,
      user.tenantId,
      dto.rating,
      dto.reviewDurationMs,
    );

    const result = await this.commandBus.execute<
      StudySessionReviewCommand,
      ReviewWordResponse
    >(command);

    return ApiResponse.success(result);
  }

  @Post(':sessionId/complete')
  @ApiOperation({ summary: 'Mark a study session as completed' })
  @ApiParam({ name: 'sessionId', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Session completed' })
  async completeSession(
    @Param('sessionId') sessionId: string,
    @Body() _dto: CompleteStudySessionRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new CompleteStudySessionCommand(
      sessionId,
      user.userId,
      user.tenantId,
    );

    const result = await this.commandBus.execute<
      CompleteStudySessionCommand,
      CompleteStudySessionResponse
    >(command);

    return ApiResponse.success(result);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get summary for a study session' })
  @ApiParam({ name: 'sessionId', format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Session summary', type: SessionSummaryResponseDto })
  async getSessionSummary(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: ITokenPayload,
  ) {
    const query = new GetSessionSummaryQuery(sessionId, user.userId, user.tenantId);

    const result = await this.queryBus.execute<
      GetSessionSummaryQuery,
      SessionSummaryResponseDto
    >(query);

    return ApiResponse.success(result);
  }
}
