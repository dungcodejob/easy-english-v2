import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import {
  type IFlashcardRepository,
  InjectFlashcardRepository,
} from '../../domain/repositories/flashcard.repository.interface';
import { FlashcardMapper } from '../../infrastructure/mappers/flashcard.mapper';
import { DueCardResponseDto } from '../../dto/responses/due-card.response.dto';
import { GetDueCardsQuery } from './get-due-cards.query';

@Injectable()
@QueryHandler(GetDueCardsQuery)
export class GetDueCardsHandler implements IQueryHandler<
  GetDueCardsQuery,
  DueCardResponseDto[]
> {
  constructor(
    @InjectFlashcardRepository()
    private readonly flashcardRepo: IFlashcardRepository,
    private readonly flashcardMapper: FlashcardMapper,
  ) {}

  async execute(query: GetDueCardsQuery): Promise<DueCardResponseDto[]> {
    const limit = query.limit ?? 20;
    const now = new Date();

    const dueCards = await this.flashcardRepo.findDueCards(
      query.userId,
      query.tenantId,
      now,
      limit,
    );

    return dueCards.map((card) => ({
      id: card.id, // AggregateRoot._id is AggregateID (string)
      front: card.front,
      back: card.back,
      hint: card.hint,
      source: card.source.value,
      state: card.schedulingState.state.value,
      dueDate: (card.schedulingState.dueDate ?? now).toISOString(),
    })) as DueCardResponseDto[];
  }
}
