import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserWordSenseProgressOrmEntity } from 'src/modules/learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity';
import {
  type IFlashcardRepository,
  InjectFlashcardRepository,
} from '../../domain/repositories/flashcard.repository.interface';
import { DueCardResponseDto } from '../../dto/responses/due-card.response.dto';
import { FlashcardMapper } from '../../infrastructure/mappers/flashcard.mapper';
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
    private readonly em: EntityManager,
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

    // Collect wordSenseIds from dictionary-linked cards for progress lookup
    const dictionaryCards = dueCards.filter((c) => c.wordSenseId !== null);
    const wordSenseIds = dictionaryCards
      .map((c) => c.wordSenseId)
      .filter((id): id is string => id !== null);

    let progressMap = new Map<
      string,
      { state: string; dueDate: Date | null }
    >();
    if (wordSenseIds.length > 0) {
      const progressRecords = await this.em.find(
        UserWordSenseProgressOrmEntity,
        {
          wordSense: { $in: wordSenseIds },
          userId: query.userId,
          archivedAt: null,
        },
        { populate: ['wordSense'] },
      );
      const records = progressRecords as UserWordSenseProgressOrmEntity[];
      progressMap = new Map<string, { state: string; dueDate: Date | null }>(
        records.map((r) => [
          r.wordSense.id,
          { state: r.state, dueDate: r.dueDate },
        ]),
      );
    }

    return dueCards.map((card) => {
      // Dictionary-linked cards: read scheduling state from UserWordSenseProgress
      if (card.wordSenseId) {
        const progress = progressMap.get(card.wordSenseId);
        return {
          id: card.id,
          front: card.front,
          back: card.back,
          hint: card.hint,
          source: card.source.value,
          state: progress?.state ?? 'new',
          dueDate: (progress?.dueDate ?? now).toISOString(),
        } as DueCardResponseDto;
      }
      // Custom cards: no UserWordSenseProgress — treat as always available for study
      return {
        id: card.id,
        front: card.front,
        back: card.back,
        hint: card.hint,
        source: card.source.value,
        state: 'new',
        dueDate: now.toISOString(),
      } as DueCardResponseDto;
    });
  }
}
