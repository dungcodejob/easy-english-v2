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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { Public } from '@shared/decorators';

import {
  PaginationParam,
  type ParsedPaginationParams,
} from '../../../core/api/pagination/pagination.decorator';
import { ApiResponse as ApiResponseBuilder } from '../../../core/api/response.builder';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import {
  ApiAuth,
  ApiPublic,
} from '../../../shared/decorators/http/http.decorator';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { GetWordSenseDetailQuery } from '../application/queries/get-word-sense-detail.query';
import { LookupWordQuery } from '../application/queries/lookup-word.query';
import { SearchWordSensesQuery } from '../application/queries/search-word-senses.query';
import { Word } from '../domain/entities/word.aggregate';
import { SearchWordSensesRequestDto } from '../dto/requests/search-word-senses.request.dto';
import { WordSenseDetailResponseDto } from '../dto/responses/word-sense-detail.response.dto';
import { WordSenseSearchResultResponseDto } from '../dto/responses/word-sense-search-result.response.dto';
import { WordResponseDto } from '../dto/responses/word.response.dto';

import type { ITokenPayload } from '../../auth/domain/ports/token-generator.interface';

@ApiTags('Dictionary')
@Controller({ version: '1', path: 'dictionary' })
export class DictionaryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('search')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiPublic({
    type: WordSenseSearchResultResponseDto,
    responseType: 'pagination',
    summary: 'Search for WordSenses by prefix',
  })
  @Public()
  async searchWordSenses(
    @Query() queryDto: SearchWordSensesRequestDto,
    @PaginationParam() pagination: ParsedPaginationParams,
  ) {
    const { q } = queryDto;
    const { top = 20, skip = 0 } = pagination;

    const query = new SearchWordSensesQuery(q, top, skip);
    const result = await this.queryBus.execute<
      SearchWordSensesQuery,
      { data: WordSenseSearchResultResponseDto[]; count: number }
    >(query);

    return ApiResponseBuilder.paginated(result.data, {
      top,
      skip,
      count: result.count,
      hasMore: skip + result.data.length < result.count,
    });
  }

  @Get('senses/:senseId')
  @ApiParam({
    name: 'senseId',
    required: true,
    description: 'ID of the WordSense',
  })
  @ApiAuth({
    auths: ['jwt'],
    type: WordSenseDetailResponseDto,
    responseType: 'single',
    summary: 'Get full details for a WordSense',
  })
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

    return ApiResponseBuilder.success(result);
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
  ) {
    if (!word || word.trim().length === 0 || word.length > 100) {
      throw new BadRequestException(
        'Word must be between 1 and 100 characters.',
      );
    }

    const query = new LookupWordQuery(word, user.tenantId, user.userId);
    const result = await this.queryBus.execute<LookupWordQuery, Word[]>(query);

    return ApiResponseBuilder.success(new WordResponseDto(result[0]));
  }
}
