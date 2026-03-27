import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LearningStateDto } from 'src/modules/dictionary/dto/responses/word-sense-detail.response.dto';

import {
  ApiPaginationParams,
  ApiResponse as ApiResponseBuilder,
  PaginationParam,
  type ParsedPaginationParams,
} from '@core/api';

import {
  createSwaggerPaginationResponseDto,
  CurrentUser,
} from '@shared/decorators';

import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';

import { AddToLearningCommand } from '../application/commands/add-to-learning.command';
import { RemoveFromLearningCommand } from '../application/commands/remove-from-learning.command';
import { ReviewWordCommand } from '../application/commands/review-word.command';
import { ReviewWordResponse } from '../application/commands/review-word.handler';
import { GetLearningListQuery } from '../application/queries/get-learning-list.query';
import { GetLearningStateQuery } from '../application/queries/get-learning-state.query';
import { AddToLearningRequestDto } from '../dto/requests/add-to-learning.request.dto';
import { ReviewWordRequestDto } from '../dto/requests/review-word.request.dto';
import { LearningListItemResponseDto } from '../dto/responses/learning-list-item.response.dto';

import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';

@ApiTags('Learning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'learning' })
export class LearningController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('senses')
  @ApiOperation({ summary: 'Add a WordSense to the learning list' })
  @ApiResponse({
    status: 201,
    description: 'WordSense added to learning list successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addToLearning(
    @Body() dto: AddToLearningRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new AddToLearningCommand(
      user.userId,
      user.tenantId,
      dto.wordSenseId,
    );

    const result = await this.commandBus.execute<
      AddToLearningCommand,
      { id: string; alreadyLearning: boolean }
    >(command);

    return ApiResponseBuilder.success(result);
  }

  @Delete('senses/:senseId')
  @ApiOperation({ summary: 'Remove a WordSense from the learning list' })
  @ApiParam({
    name: 'senseId',
    required: true,
    description: 'ID of the WordSense to remove',
  })
  @ApiResponse({
    status: 200,
    description: 'WordSense removed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeFromLearning(
    @Param('senseId') senseId: string,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new RemoveFromLearningCommand(user.userId, senseId);

    const result = await this.commandBus.execute<
      RemoveFromLearningCommand,
      { success: boolean; wasLearning: boolean }
    >(command);

    return ApiResponseBuilder.success(result);
  }

  @Get('senses')
  @ApiOperation({ summary: 'Get user learning list' })
  @ApiPaginationParams()
  @createSwaggerPaginationResponseDto(LearningListItemResponseDto)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLearningList(
    @PaginationParam() pagination: ParsedPaginationParams,
    @CurrentUser() user: ITokenPayload,
  ) {
    const listQuery = new GetLearningListQuery(
      user.userId,
      pagination.top,
      pagination.skip,
    );
    const { data, count } = await this.queryBus.execute<
      GetLearningListQuery,
      { data: LearningListItemResponseDto[]; count: number }
    >(listQuery);

    return ApiResponseBuilder.paginated(data, {
      top: pagination.top,
      skip: pagination.skip,
      count,
      hasMore: pagination.skip + data.length < count,
    });
  }

  @Get('senses/:senseId/state')
  @ApiOperation({ summary: 'Get learning state for a specific word sense' })
  @ApiParam({
    name: 'senseId',
    required: true,
    description: 'ID of the WordSense to get state for',
  })
  @ApiResponse({
    status: 200,
    description: 'Learning state retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLearningState(
    @Param('senseId') senseId: string,
    @CurrentUser() user: ITokenPayload,
  ) {
    const query = new GetLearningStateQuery(user.userId, senseId);
    const result = await this.queryBus.execute<
      GetLearningStateQuery,
      LearningStateDto
    >(query);

    return ApiResponseBuilder.success(result);
  }

  @Post('senses/:senseId/review')
  @ApiOperation({
    summary: 'Review a word in the learning list (dictionary mode)',
  })
  @ApiParam({
    name: 'senseId',
    required: true,
    description: 'ID of the WordSense to review',
  })
  @ApiResponse({
    status: 200,
    description: 'Review recorded successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Word not found in learning list' })
  @ApiResponse({ status: 409, description: 'Word is archived' })
  async reviewWord(
    @Param('senseId') senseId: string,
    @Body() dto: ReviewWordRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new ReviewWordCommand(
      user.userId,
      senseId,
      dto.rating,
      dto.reviewDurationMs,
    );

    const result = await this.commandBus.execute<
      ReviewWordCommand,
      ReviewWordResponse
    >(command);

    return ApiResponseBuilder.success(result);
  }
}
