import { type Mapper } from '@core/ddd';

import { type FsrsParameters } from '../../../../learning/progress/domain/value-objects/fsrs-parameters.vo';
import { TopicWord } from '../../domain/entities/topic-word.entity';
import { Topic } from '../../domain/entities/topic.aggregate';
import { TopicWordOrmEntity } from '../persistence/topic-word.orm-entity';
import { TopicOrmEntity } from '../persistence/topic.orm-entity';

export class TopicMapper implements Mapper<Topic, TopicOrmEntity, object> {
  toDomain(orm: TopicOrmEntity): Topic {
    const words: TopicWord[] = orm.words
      .getItems()
      .map((ormWord) =>
        TopicWord.rehydrate(ormWord.id, ormWord.wordSenseId, ormWord.addedAt),
      );

    return Topic.rehydrate(
      {
        id: orm.id,
        tenantId: orm.tenantId,
        userId: orm.userId,
        name: orm.name,
        description: orm.description ?? null,
      },
      orm.createdAt,
      orm.updatedAt,
      words,
    );
  }

  toPersistence(domain: Topic): TopicOrmEntity {
    const orm = new TopicOrmEntity(
      domain.tenantId,
      domain.userId,
      domain.name,
      domain.description ?? undefined,
    );

    orm.id = domain.id;

    for (const word of domain.words.getItems()) {
      const wordOrm = new TopicWordOrmEntity(orm, word.wordSenseId);

      wordOrm.id = word.id;
      wordOrm.addedAt = word.addedAt;
      orm.words.add(wordOrm);
    }

    return orm;
  }

  toResponse(domain: Topic, progressMap?: Map<string, FsrsParameters>): object {
    const words = domain.words.getItems().map((word) => ({
      id: word.id,
      topicId: domain.id,
      wordSenseId: word.wordSenseId,
      status: this.deriveStatus(progressMap?.get(word.wordSenseId)),
      addedAt: word.addedAt,
    }));

    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
      words,
    };
  }

  /**
   * Derives TopicWord status from UserWordSenseProgress FSRS params.
   * Status logic: relearning|learning → LEARNING, isMastered → MASTERED, else → NEW
   * (ordered so relearning takes priority over isMastered).
   */
  private deriveStatus(params: FsrsParameters | undefined): string {
    if (!params) return 'NEW';
    if (
      params.state.value === 'relearning' ||
      params.state.value === 'learning'
    ) {
      return 'LEARNING';
    }
    if (params.isMastered) return 'MASTERED';

    return 'NEW';
  }
}
