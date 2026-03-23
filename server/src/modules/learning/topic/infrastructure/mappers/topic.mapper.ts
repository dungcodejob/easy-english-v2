import { Mapper } from '@core/ddd';
import { Topic } from '../../domain/entities/topic.aggregate';
import { TopicWord } from '../../domain/entities/topic-word.entity';
import { TopicOrmEntity } from '../persistence/topic.orm-entity';
import { TopicWordOrmEntity } from '../persistence/topic-word.orm-entity';
import { WordLearningStatus } from '../../domain/value-objects/word-learning-status.vo';

export class TopicMapper implements Mapper<Topic, TopicOrmEntity, object> {
  toDomain(orm: TopicOrmEntity): Topic {
    const words: TopicWord[] = orm.words
      .getItems()
      .map((ormWord) =>
        TopicWord.rehydrate(
          ormWord.id,
          ormWord.wordSenseId,
          WordLearningStatus.from(ormWord.status),
          ormWord.addedAt,
        ),
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
      wordOrm.status = word.status.value as TopicWordOrmEntity['status'];
      wordOrm.addedAt = word.addedAt;
      orm.words.add(wordOrm);
    }

    return orm;
  }

  toResponse(domain: Topic): object {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
    };
  }
}
