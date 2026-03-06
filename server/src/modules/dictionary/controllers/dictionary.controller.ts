import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@shared/decorators';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { ITokenPayload } from '../../auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { GetWordSenseDetailQuery } from '../application/queries/get-word-sense-detail.query';
import { LookupWordQuery } from '../application/queries/lookup-word.query';
import { SearchWordSensesQuery } from '../application/queries/search-word-senses.query';
import { Word } from '../domain/entities/word.aggregate';
import { WordSenseDetailResponseDto } from '../dto/responses/word-sense-detail.response.dto';
import { WordSenseSearchResultResponseDto } from '../dto/responses/word-sense-search-result.response.dto';
import { WordResponseDto } from '../dto/responses/word.response.dto';

@ApiTags('Dictionary')
@Controller({ version: '1', path: 'dictionary' })
export class DictionaryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for WordSenses by prefix' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search term (min 1 char, max 100)',
  })
  @ApiQuery({
    name: '$top',
    required: false,
    type: Number,
    description: 'Page size (default 20, max 50)',
  })
  @ApiQuery({
    name: '$skip',
    required: false,
    type: Number,
    description: 'Offset',
  })
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Public()
  async searchWordSenses(
    @Query('q') q: string,
    @Query('$top') topStr?: string,
    @Query('$skip') skipStr?: string,
  ) {
    if (!q || q.trim().length === 0 || q.length > 100) {
      throw new BadRequestException(
        'Query must be between 1 and 100 characters',
      );
    }

    const top = topStr ? parseInt(topStr, 10) : 20;
    const skip = skipStr ? parseInt(skipStr, 10) : 0;

    const validTop = Math.min(Math.max(1, top), 50);
    const validSkip = Math.max(0, skip);

    const query = new SearchWordSensesQuery(q.trim(), validTop, validSkip);
    const result = await this.queryBus.execute<
      SearchWordSensesQuery,
      { data: WordSenseSearchResultResponseDto[]; count: number }
    >(query);

    return {
      success: true,
      data: result.data,
      pagination: {
        top: validTop,
        skip: validSkip,
        count: result.count,
        hasMore: validSkip + result.data.length < result.count,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('senses/:senseId')
  @ApiOperation({ summary: 'Get full details for a WordSense' })
  @ApiParam({
    name: 'senseId',
    required: true,
    description: 'ID of the WordSense',
  })
  @ApiResponse({
    status: 200,
    description: 'WordSense details',
    type: WordSenseDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'WordSense not found' })
  async getWordSenseDetail(
    @Param('senseId') senseId: string,
    @CurrentUser() user?: ITokenPayload,
  ) {
    if (!senseId) {
      throw new BadRequestException('senseId is required');
    }

    const query = new GetWordSenseDetailQuery(
      senseId,
      user?.tenantId || 'default',
      user?.userId || '',
    );

    const result = await this.queryBus.execute<
      GetWordSenseDetailQuery,
      WordSenseDetailResponseDto
    >(query);

    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('lookup/:word')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lookup a word definition' })
  @ApiParam({
    name: 'word',
    example: 'hello',
    description: 'The word to lookup',
  })
  @ApiResponse({
    status: 200,
    description: 'Word definition retrieved successfully',
    type: WordResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Word not found' })
  @ApiResponse({ status: 400, description: 'Invalid word' })
  async lookupWord(
    @Param('word') word: string,
    @CurrentUser() user: ITokenPayload,
  ): Promise<WordResponseDto> {
    if (!word || word.trim().length === 0 || word.length > 100) {
      throw new BadRequestException(
        'Word must be between 1 and 100 characters.',
      );
    }

    const query = new LookupWordQuery(word, user.tenantId, user.userId);
    const result = await this.queryBus.execute<LookupWordQuery, Word[]>(query);

    return new WordResponseDto(result[0]);
  }
}
