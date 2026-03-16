import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IFlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { GetFlashcardsQuery } from './get-flashcards.query';
import { FlashcardResponseDto } from '../../dto/responses/flashcard.response.dto';

@QueryHandler(GetFlashcardsQuery)
export class GetFlashcardsHandler implements IQueryHandler<GetFlashcardsQuery> {
  constructor(private readonly flashcardRepo: IFlashcardRepository) {}

  async execute(query: GetFlashcardsQuery): Promise<FlashcardResponseDto[]> {
    const flashcards = await this.flashcardRepo.findByUserId(query.userId, query.tenantId);

    return flashcards.map((f) => ({
      id: f.id,
      front: f.front,
      back: f.back,
      hint: f.hint,
      notes: f.notes,
      source: f.source,
      wordSenseId: f.wordSenseId,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    }));
  }
}
