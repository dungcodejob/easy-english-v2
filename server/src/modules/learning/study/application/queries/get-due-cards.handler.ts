import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';
import { UserWordSenseProgressOrmEntity } from 'src/modules/learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity';

import { GetDueCardsQuery } from './get-due-cards.query';
import { InjectFlashcardRepository } from '../../../../flashcard/domain/repositories/flashcard.repository.interface';
import {
  StudyCardResponseDto,
  StudyCardsEnvelopeDto,
} from '../../dto/responses/study-card.response.dto';

import type { IFlashcardRepository } from '../../../../flashcard/domain/repositories/flashcard.repository.interface';

const PHASE1_CARD_CAP = 100;

@QueryHandler(GetDueCardsQuery)
export class GetDueCardsHandler implements IQueryHandler<
  GetDueCardsQuery,
  StudyCardsEnvelopeDto
> {
  constructor(
    private readonly em: EntityManager,
    @InjectFlashcardRepository()
    private readonly flashcardRepo: IFlashcardRepository,
  ) {}

  async execute(query: GetDueCardsQuery): Promise<StudyCardsEnvelopeDto> {
    const now = new Date();
    const cards: StudyCardResponseDto[] = [];

    // 1. Dictionary cards — only when source !== 'flashcard'
    if (query.source !== 'flashcard') {
      const progressRows = await this.em.find(
        UserWordSenseProgressOrmEntity,
        {
          userId: query.userId,
          tenantId: query.tenantId,
          archivedAt: null,
          dueDate: { $lte: now },
        },
        {
          populate: ['wordSense', 'wordSense.word', 'wordSense.examples'],
          orderBy: { dueDate: 'ASC' },
        },
      );

      const mapped = progressRows
        .map((progress) => this.mapDictionaryCard(progress, now))
        .filter((card): card is StudyCardResponseDto => card !== null);

      cards.push(...mapped);
    }

    // 2. Flashcard cards — only when source !== 'dictionary'
    if (query.source !== 'dictionary') {
      const flashcards = await this.flashcardRepo.findDueCards(
        query.userId,
        query.tenantId,
        now,
        100,
      );

      const flashcardCards = flashcards
        .map((flashcard) => this.mapFlashcardCard(flashcard))
        .filter((card): card is StudyCardResponseDto => card !== null);

      cards.push(...flashcardCards);
    }

    // 3. Deduplicate — flashcard cards without wordSenseId always included
    // Flashcard cards WITH wordSenseId win over duplicate dictionary entries
    const deduped = this.dedupeByWordSense(cards);

    // 4. Sort by dueDate ASC, then by wordSenseId
    deduped.sort((a, b) => {
      const aTime = a.dueDate
        ? new Date(a.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate
        ? new Date(b.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;

      if (aTime !== bTime) return aTime - bTime;

      return a.wordSenseId.localeCompare(b.wordSenseId);
    });

    const total = deduped.length;
    const limited = deduped.slice(0, PHASE1_CARD_CAP);

    return {
      cards: limited,
      total,
      capped: total > PHASE1_CARD_CAP,
    };
  }

  private dedupeByWordSense(
    cards: StudyCardResponseDto[],
  ): StudyCardResponseDto[] {
    const map = new Map<string, StudyCardResponseDto>();

    for (const card of cards) {
      if (!map.has(card.wordSenseId)) {
        map.set(card.wordSenseId, card);
      }
    }

    return [...map.values()];
  }

  private mapDictionaryCard(
    progress: UserWordSenseProgressOrmEntity,
    now: Date,
  ): StudyCardResponseDto | null {
    const sense = progress.wordSense;
    const word = sense.word;

    if (!word?.text || !sense.definition || !sense.partOfSpeech) {
      return null;
    }

    const firstExample =
      sense.examples?.getItems()?.sort((a, b) => a.order - b.order)?.[0] ??
      null;

    const dueDateIso = progress.dueDate ? progress.dueDate.toISOString() : null;

    return {
      wordSenseId: sense.id,
      front: `${word.text} (${sense.partOfSpeech})`,
      back: {
        definition: sense.definition,
        example: firstExample?.text ?? null,
      },
      hint: sense.partOfSpeech,
      dueDate: dueDateIso,
      isDue: progress.dueDate !== null && progress.dueDate <= now,
      isMastered: progress.stability >= 30 && progress.lapses === 0,
      masteryLevel: this.toMasteryLevel(progress),
    };
  }

  private mapFlashcardCard(flashcard: {
    id: string;
    front: string;
    back: string;
    hint: string | null;
    wordSenseId: string | null;
  }): StudyCardResponseDto | null {
    if (!flashcard.front || !flashcard.back) {
      return null;
    }

    return {
      // Use cardId as wordSenseId for custom flashcards (no wordSenseId)
      // For dictionary-linked flashcards, use wordSenseId
      wordSenseId: flashcard.wordSenseId ?? flashcard.id,
      front: flashcard.front,
      back: {
        definition: flashcard.back,
        example: null,
      },
      hint: flashcard.hint ?? '',
      dueDate: new Date().toISOString(),
      isDue: true,
      isMastered: false,
      masteryLevel: 0,
    };
  }

  private toMasteryLevel(
    progress: UserWordSenseProgressOrmEntity,
  ): 0 | 1 | 2 | 3 | 4 | 5 {
    const level = progress.masteryLevel;

    if (level < 0) return 0;
    if (level > 5) return 5;

    return level as 0 | 1 | 2 | 3 | 4 | 5;
  }
}
