import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import {
  type IFlashcardRepository,
  InjectFlashcardRepository,
} from '../../domain/repositories/flashcard.repository.interface';
import { FlashcardMapper } from '../../infrastructure/mappers/flashcard.mapper';
import { FlashcardResponseDto } from '../../dto/responses/flashcard.response.dto';
import { GetFlashcardsQuery } from './get-flashcards.query';

@Injectable()
@QueryHandler(GetFlashcardsQuery)
export class GetFlashcardsHandler implements IQueryHandler<GetFlashcardsQuery, FlashcardResponseDto[]> {
  constructor(
    @InjectFlashcardRepository()
    private readonly flashcardRepo: IFlashcardRepository,
    private readonly flashcardMapper: FlashcardMapper,
  ) {}

  async execute(query: GetFlashcardsQuery): Promise<FlashcardResponseDto[]> {
    const flashcards = await this.flashcardRepo.findByUserId(query.userId, query.tenantId);
    return flashcards.map((f) => this.flashcardMapper.toResponse(f) as FlashcardResponseDto);
  }
}
