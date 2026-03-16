import type { ITokenPayload } from '@auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ApiResponse as ApiResponseBuilder } from '@core/api';
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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { CreateFlashcardCommand } from '../application/commands/create-flashcard.command';
import { UpdateFlashcardCommand } from '../application/commands/update-flashcard.command';
import { DeleteFlashcardCommand } from '../application/commands/delete-flashcard.command';
import { GetFlashcardsQuery } from '../application/queries/get-flashcards.query';
import { CreateFlashcardRequestDto } from '../dto/requests/create-flashcard.request.dto';
import { UpdateFlashcardRequestDto } from '../dto/requests/update-flashcard.request.dto';
import { FlashcardResponseDto } from '../dto/responses/flashcard.response.dto';

@ApiTags('Flashcards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'flashcards' })
export class FlashcardController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all flashcards for user' })
  async getFlashcards(@CurrentUser() user: ITokenPayload) {
    const query = new GetFlashcardsQuery(user.userId, user.tenantId);
    const flashcards = await this.queryBus.execute<GetFlashcardsQuery, FlashcardResponseDto[]>(query);
    return ApiResponseBuilder.success(flashcards);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new flashcard' })
  @ApiResponse({ status: 201, type: FlashcardResponseDto })
  async createFlashcard(
    @Body() dto: CreateFlashcardRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new CreateFlashcardCommand(
      user.tenantId,
      user.userId,
      dto.front,
      dto.back,
      dto.source,
      dto.hint,
      dto.notes,
      dto.wordSenseId,
    );
    const flashcard = await this.commandBus.execute<CreateFlashcardCommand, FlashcardResponseDto>(command);
    return ApiResponseBuilder.success(flashcard);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a flashcard' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, type: FlashcardResponseDto })
  async updateFlashcard(
    @Param('id') id: string,
    @Body() dto: UpdateFlashcardRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new UpdateFlashcardCommand(
      id,
      user.userId,
      user.tenantId,
      dto.front ?? '',
      dto.back ?? '',
      dto.hint,
      dto.notes,
    );
    const flashcard = await this.commandBus.execute<UpdateFlashcardCommand, FlashcardResponseDto | null>(command);
    return ApiResponseBuilder.success(flashcard);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a flashcard' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200 })
  async deleteFlashcard(
    @Param('id') id: string,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new DeleteFlashcardCommand(id, user.userId, user.tenantId);
    const result = await this.commandBus.execute<DeleteFlashcardCommand, boolean>(command);
    return ApiResponseBuilder.success(result);
  }
}
