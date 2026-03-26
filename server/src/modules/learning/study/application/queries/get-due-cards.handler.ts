import { EntityManager } from '@mikro-orm/postgresql';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserWordSenseProgressOrmEntity } from 'src/modules/learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity';
import {
  StudyCardResponseDto,
  StudyCardsEnvelopeDto,
} from '../../dto/responses/study-card.response.dto';
import { GetDueCardsQuery } from './get-due-cards.query';

const PHASE1_CARD_CAP = 100;

@QueryHandler(GetDueCardsQuery)
export class GetDueCardsHandler implements IQueryHandler<
  GetDueCardsQuery,
  StudyCardsEnvelopeDto
> {
  constructor(private readonly em: EntityManager) {}

  async execute(query: GetDueCardsQuery): Promise<StudyCardsEnvelopeDto> {
    const now = new Date();

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
      .map((progress) => this.mapToCard(progress, now))
      .filter((card): card is StudyCardResponseDto => card !== null);

    const deduped = this.dedupeByWordSense(mapped);
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
    const cards = deduped.slice(0, PHASE1_CARD_CAP);

    return {
      cards,
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

  private mapToCard(
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

  private toMasteryLevel(
    progress: UserWordSenseProgressOrmEntity,
  ): 0 | 1 | 2 | 3 | 4 | 5 {
    const level = progress.masteryLevel;
    if (level < 0) return 0;
    if (level > 5) return 5;
    return level as 0 | 1 | 2 | 3 | 4 | 5;
  }
}
