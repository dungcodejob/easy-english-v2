import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';
import { UserWordSenseProgressOrmEntity } from 'src/modules/learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity';
import {
  InjectTopicRepository,
  type ITopicRepository,
} from 'src/modules/learning/topic/domain/repositories/topic.repository.interface';
import { TopicOrmEntity } from 'src/modules/learning/topic/infrastructure/persistence/topic.orm-entity';
import { validate as isUuid } from 'uuid';

import { GetTopicCardsQuery } from './get-topic-cards.query';
import {
  StudyCardResponseDto,
  TopicStudyCardsEnvelopeDto,
} from '../../dto/responses/study-card.response.dto';

const PHASE1_CARD_CAP = 100;

@QueryHandler(GetTopicCardsQuery)
export class GetTopicCardsHandler implements IQueryHandler<
  GetTopicCardsQuery,
  TopicStudyCardsEnvelopeDto
> {
  constructor(
    private readonly em: EntityManager,
    @InjectTopicRepository()
    private readonly topicRepo: ITopicRepository,
  ) {}

  async execute(
    query: GetTopicCardsQuery,
  ): Promise<TopicStudyCardsEnvelopeDto> {
    if (!isUuid(query.topicId)) {
      throw new BadRequestException('Invalid topicId format');
    }

    const topic = await this.em.findOne(TopicOrmEntity, {
      id: query.topicId,
      tenantId: query.tenantId,
      userId: query.userId,
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const topicWords = await this.topicRepo.findWordsByTopic(
      query.topicId,
      query.tenantId,
      query.userId,
    );

    if (topicWords.length === 0) {
      return { cards: [], total: 0, capped: false, topicId: query.topicId };
    }

    const wordSenseIds = [...new Set(topicWords.map((w) => w.wordSenseId))];

    const progressRows = await this.em.find(
      UserWordSenseProgressOrmEntity,
      {
        userId: query.userId,
        tenantId: query.tenantId,
        archivedAt: null,
        wordSense: { $in: wordSenseIds },
      },
      {
        populate: ['wordSense', 'wordSense.word', 'wordSense.examples'],
      },
    );

    const progressBySense = new Map(
      progressRows.map((p) => [p.wordSense.id, p] as const),
    );

    const now = new Date();
    const cards: (StudyCardResponseDto & { __addedAt: Date })[] = [];

    for (const topicWord of topicWords) {
      const progress = progressBySense.get(topicWord.wordSenseId);

      if (!progress) {
        continue;
      }

      const mapped = this.mapToCard(progress, now);

      if (!mapped) {
        continue;
      }

      cards.push({ ...mapped, __addedAt: topicWord.addedAt });
    }

    const deduped = this.dedupeByWordSenseWithAddedAt(cards);

    deduped.sort((a, b) => {
      const timeDiff = a.__addedAt.getTime() - b.__addedAt.getTime();

      if (timeDiff !== 0) return timeDiff;

      return a.wordSenseId.localeCompare(b.wordSenseId);
    });

    const total = deduped.length;
    const finalCards = deduped
      .slice(0, PHASE1_CARD_CAP)

      .map(({ __addedAt: _, ...card }) => card);

    return {
      cards: finalCards,
      total,
      capped: total > PHASE1_CARD_CAP,
      topicId: query.topicId,
    };
  }

  private dedupeByWordSenseWithAddedAt(
    cards: (StudyCardResponseDto & { __addedAt: Date })[],
  ): (StudyCardResponseDto & { __addedAt: Date })[] {
    const bySense = new Map<
      string,
      StudyCardResponseDto & { __addedAt: Date }
    >();

    for (const card of cards) {
      const existing = bySense.get(card.wordSenseId);

      if (!existing || card.__addedAt < existing.__addedAt) {
        bySense.set(card.wordSenseId, card);
      }
    }

    return [...bySense.values()];
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

    return {
      wordSenseId: sense.id,
      front: `${word.text} (${sense.partOfSpeech})`,
      back: {
        definition: sense.definition,
        example: firstExample?.text ?? null,
      },
      hint: sense.partOfSpeech,
      dueDate: progress.dueDate ? progress.dueDate.toISOString() : null,
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
