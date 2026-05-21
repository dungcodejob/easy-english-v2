import { Injectable } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';

import {
  ILearningReadRepository,
  LearningListItemReadModel,
} from '../../application/repositories/learning-read.repository.interface';
import { UserWordSenseProgressOrmEntity } from '../persistence/user-word-sense-progress.orm-entity';

@Injectable()
export class LearningReadRepository implements ILearningReadRepository {
  constructor(private readonly em: EntityManager) {}

  async findLearningList(
    userId: string,
    top: number,
    skip: number,
  ): Promise<{ data: LearningListItemReadModel[]; count: number }> {
    const qb = this.em
      .createQueryBuilder(UserWordSenseProgressOrmEntity, 'uwsp')
      .leftJoinAndSelect('uwsp.wordSense', 'sense')
      .leftJoinAndSelect('sense.word', 'word')
      .leftJoinAndSelect('word.pronunciations', 'pronunciations')
      .where({
        userId,
        archivedAt: null,
      })
      .orderBy({ 'uwsp.createdAt': 'DESC' })
      .limit(top)
      .offset(skip);

    const [records, count] = await qb.getResultAndCount();

    return {
      data: records.map((record) => {
        const sense = record.wordSense;
        const word = sense.word;

        return {
          id: record.id,
          senseId: sense.id,
          wordText: word.text,
          definition: sense.definition,
          shortDefinition: sense.shortDefinition || null,
          partOfSpeech: sense.partOfSpeech,
          definitionVi: sense.definitionVi || null,
          pronunciations:
            word.pronunciations?.getItems()?.map((p) => ({
              ipa: p.ipa,
              audioUrl: p.audioUrl || null,
              region: p.region,
            })) || [],
          isLearning: record.archivedAt === null,
          masteryLevel: record.masteryLevel,
          reviewCount: record.reviewCount,
          nextReviewAt: record.nextReviewAt || null,
          lastReviewedAt: record.lastReviewedAt || null,
          createdAt: record.createdAt,
        };
      }),
      count,
    };
  }

  async checkLearnedStatus(
    userId: string,
    senseIds: string[],
  ): Promise<string[]> {
    if (!senseIds || senseIds.length === 0) {
      return [];
    }

    const records = await this.em.find(
      UserWordSenseProgressOrmEntity,
      {
        userId,
        wordSense: { $in: senseIds },
        archivedAt: null,
      },
      { fields: ['wordSense'] },
    );

    return records.map((r) => r.wordSense.id);
  }
}
