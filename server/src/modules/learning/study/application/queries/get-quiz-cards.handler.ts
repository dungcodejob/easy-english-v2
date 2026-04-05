import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';
import { UserWordSenseProgressOrmEntity } from 'src/modules/learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity';

import { GetQuizCardsQuery } from './get-quiz-cards.query';
import {
  QuizCardDto,
  QuizOptionDto,
} from '../../dto/responses/quiz-card.response.dto';

const LABEL_ORDER = ['A', 'B', 'C', 'D'] as const;

@QueryHandler(GetQuizCardsQuery)
export class GetQuizCardsHandler implements IQueryHandler<
  GetQuizCardsQuery,
  QuizCardDto[]
> {
  constructor(private readonly em: EntityManager) {}

  async execute(query: GetQuizCardsQuery): Promise<QuizCardDto[]> {
    const now = new Date();

    // 1. Fetch due cards (same as GetDueCardsHandler)
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

    // 2. Dedupe by wordSenseId, cap at limit
    const deduped = this.dedupeByWordSense(progressRows, query.limit);

    // 3. For each card, generate 4-option quiz set
    const quizCards: QuizCardDto[] = [];

    for (const progress of deduped) {
      const sense = progress.wordSense;
      const word = sense.word;

      if (!word?.text || !sense.definition || !sense.partOfSpeech) continue;

      const correctText = `${word.text} — ${sense.definition.slice(0, 80)}`;

      // 4. Fetch 3 distractors (same POS, different id)
      const distractors = await this.fetchDistractors(
        sense.id,
        sense.partOfSpeech,
        3,
      );

      // Pad with placeholders if not enough distractors
      while (distractors.length < 3) {
        distractors.push({
          id: `placeholder-${distractors.length}`,
          headword: 'other',
          definition: 'another word with this meaning',
        });
      }

      const distractorTexts = distractors.map(
        (d) => `${d.headword} — ${d.definition.slice(0, 80)}`,
      );

      // 5. Build options: correct + 3 distractors, shuffled
      const allOptions: {
        label: 'A' | 'B' | 'C' | 'D';
        text: string;
        correct: boolean;
      }[] = [
        { label: 'A', text: correctText, correct: true },
        ...distractorTexts.slice(0, 3).map((text, i) => ({
          label: LABEL_ORDER[i + 1],
          text,
          correct: false,
        })),
      ];

      // Shuffle options, track correct label
      const shuffled = this.shuffle([...allOptions]);
      const correctAnswer = shuffled.find((o) => o.correct)!.label;
      const options: QuizOptionDto[] = shuffled.map(({ label, text }) => ({
        label,
        text,
      }));

      quizCards.push({
        wordSenseId: sense.id,
        word: word.text,
        partOfSpeech: sense.partOfSpeech,
        question: word.text,
        options,
        correctAnswer,
      });
    }

    return quizCards;
  }

  private async fetchDistractors(
    targetId: string,
    partOfSpeech: string,
    count: number,
  ): Promise<{ id: string; headword: string; definition: string }[]> {
    try {
      const result = await this.em.execute(
        `SELECT ws.id, w.text as headword, ws.definition
         FROM word_sense ws
         JOIN word w ON w.id = ws.word_id
         WHERE ws.part_of_speech = $1
           AND ws.id != $2
         ORDER BY RANDOM()
         LIMIT $3`,
        [partOfSpeech, targetId, count],
      );

      return (result as unknown[][]).map((row) => ({
        id: row[0] as string,
        headword: row[1] as string,
        definition: row[2] as string,
      }));
    } catch {
      return [];
    }
  }

  private dedupeByWordSense(
    rows: UserWordSenseProgressOrmEntity[],
    limit: number,
  ): UserWordSenseProgressOrmEntity[] {
    const seen = new Set<string>();
    const result: UserWordSenseProgressOrmEntity[] = [];

    for (const row of rows) {
      if (!seen.has(row.wordSense.id)) {
        seen.add(row.wordSense.id);
        result.push(row);
        if (result.length >= limit) break;
      }
    }

    return result;
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];

    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }
}
