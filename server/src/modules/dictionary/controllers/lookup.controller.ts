import {
  BadRequestException,
  Controller,
  Get,
  Param,
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
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { ITokenPayload } from '../../auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { LookupWordQuery } from '../application/queries/lookup-word.query';
import { WordSnapshot } from '../domain/value-objects/word-snapshot.vo';
import { WordSnapshotResponseDto } from '../dto/responses/word-snapshot.response.dto';

@ApiTags('Dictionary')
@Controller('dictionary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LookupController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('lookup/:word')
  @ApiOperation({ summary: 'Lookup a word definition' })
  @ApiParam({
    name: 'word',
    example: 'hello',
    description: 'The word to lookup',
  })
  @ApiResponse({
    status: 200,
    description: 'Word definition retrieved successfully',
    type: WordSnapshotResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Word not found' })
  @ApiResponse({ status: 400, description: 'Invalid word' })
  async lookupWord(
    @Param('word') word: string,
    @CurrentUser() user: ITokenPayload,
  ): Promise<WordSnapshotResponseDto> {
    if (!word || word.trim().length === 0 || word.length > 100) {
      throw new BadRequestException(
        'Word must be between 1 and 100 characters.',
      );
    }

    const query = new LookupWordQuery(word, user.tenantId, user.userId);
    const result = await this.queryBus.execute<LookupWordQuery, WordSnapshot>(
      query,
    );

    return new WordSnapshotResponseDto(result);
  }
}
