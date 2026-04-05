import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiResponse as ApiResponseBuilder } from '@core/api';
import {
  ApiPaginationParams,
  PaginationParam,
  type ParsedPaginationParams,
} from '@core/api';

import {
  createSwaggerPaginationResponseDto,
  CurrentUser,
} from '@shared/decorators';

import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';

import { AddTopicWordCommand } from '../application/commands/add-topic-word.command';
import { CreateTopicCommand } from '../application/commands/create-topic.command';
import { DeleteTopicCommand } from '../application/commands/delete-topic.command';
import { RemoveTopicWordCommand } from '../application/commands/remove-topic-word.command';
import { UpdateTopicCommand } from '../application/commands/update-topic.command';
import { GetTopicDetailQuery } from '../application/queries/get-topic-detail.query';
import { GetTopicsQuery } from '../application/queries/get-topics.query';
import { ListTopicWordsQuery } from '../application/queries/list-topic-words.query';
import {
  AddTopicWordRequestDto,
  CreateTopicRequestDto,
  UpdateTopicRequestDto,
} from '../dto/requests/topic-requests.dto';
import { TopicDto, TopicWordDto } from '../dto/responses/topic.dto';

import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';

@ApiTags('Topics')
@Controller('topics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TopicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({ status: 201, type: TopicDto })
  async createTopic(
    @CurrentUser() user: ITokenPayload,
    @Body() dto: CreateTopicRequestDto,
  ) {
    const tenantId = user.tenantId;
    const userId = user.userId;

    const topic = await this.commandBus.execute<CreateTopicCommand, TopicDto>(
      new CreateTopicCommand(tenantId, userId, dto.name, dto.description),
    );

    return ApiResponseBuilder.success({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of topics' })
  @ApiPaginationParams()
  @createSwaggerPaginationResponseDto(TopicDto)
  async getTopics(
    @CurrentUser() user: ITokenPayload,
    @PaginationParam() pagination: ParsedPaginationParams,
  ) {
    const { top = 20, skip = 0 } = pagination;
    const tenantId = user.tenantId;
    const userId = user.userId;

    const result = await this.queryBus.execute<
      GetTopicsQuery,
      { data: TopicDto[]; count: number }
    >(new GetTopicsQuery(tenantId, userId, top, skip));

    return ApiResponseBuilder.paginated(result.data, {
      top,
      skip,
      count: result.count,
      hasMore: skip + result.data.length < result.count,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic details' })
  async getTopicDetail(
    @CurrentUser() user: ITokenPayload,
    @Param('id') id: string,
  ) {
    const tenantId = user.tenantId;
    const query = new GetTopicDetailQuery(tenantId, user.userId, id);
    const result = await this.queryBus.execute<GetTopicDetailQuery, TopicDto>(
      query,
    );

    if (!result) {
      return null;
    }

    return ApiResponseBuilder.success({
      id: result.id,
      name: result.name,
      description: result.description,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a topic' })
  async updateTopic(
    @CurrentUser() user: ITokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTopicRequestDto,
  ) {
    const tenantId = user.tenantId;
    const userId = user.userId;

    const topic = await this.commandBus.execute<UpdateTopicCommand, TopicDto>(
      new UpdateTopicCommand(
        tenantId,
        userId,
        id,
        dto.name ?? '',
        dto.description,
      ),
    );

    return ApiResponseBuilder.success({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  async deleteTopic(
    @CurrentUser() user: ITokenPayload,
    @Param('id') id: string,
  ) {
    const tenantId = user.tenantId;
    const userId = user.userId;

    await this.commandBus.execute(new DeleteTopicCommand(tenantId, userId, id));

    return ApiResponseBuilder.success(true);
  }

  @Get(':id/words')
  @ApiOperation({ summary: 'List words in a topic' })
  @ApiPaginationParams()
  @createSwaggerPaginationResponseDto(TopicWordDto)
  async getTopicWords(
    @CurrentUser() user: ITokenPayload,
    @Param('id') id: string,
    @PaginationParam() pagination: ParsedPaginationParams,
  ) {
    const { top = 20, skip = 0 } = pagination;
    const tenantId = user.tenantId;
    const userId = user.userId;

    const query = new ListTopicWordsQuery(tenantId, userId, id, top, skip);
    const result = await this.queryBus.execute<
      ListTopicWordsQuery,
      { data: TopicWordDto[]; count: number }
    >(query);

    return ApiResponseBuilder.paginated(result.data, {
      top,
      skip,
      count: result.count,
      hasMore: skip + result.data.length < result.count,
    });
  }

  @Post(':id/words')
  @ApiOperation({ summary: 'Add a word to a topic' })
  async addWordToTopic(
    @CurrentUser() user: ITokenPayload,
    @Param('id') id: string,
    @Body() dto: AddTopicWordRequestDto,
  ) {
    const tenantId = user.tenantId;
    const userId = user.userId;

    const topicWord = await this.commandBus.execute<
      AddTopicWordCommand,
      TopicWordDto
    >(new AddTopicWordCommand(tenantId, userId, id, dto.wordSenseId));

    return ApiResponseBuilder.success({
      id: topicWord.id,
      wordSenseId: topicWord.wordSenseId,
      status: topicWord.status,
      addedAt: topicWord.addedAt,
    });
  }

  @Delete(':id/words/:wordId')
  @ApiOperation({ summary: 'Remove a word from a topic' })
  async removeWordFromTopic(
    @CurrentUser() user: ITokenPayload,
    @Param('id') id: string,
    @Param('wordId') wordId: string,
  ) {
    const tenantId = user.tenantId;
    const userId = user.userId;

    await this.commandBus.execute(
      new RemoveTopicWordCommand(tenantId, userId, id, wordId),
    );

    return ApiResponseBuilder.success(true);
  }
}
