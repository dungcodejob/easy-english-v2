import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { TopicOrmEntity } from './topic.orm-entity';

export enum WordLearningStatus {
  NEW = 'NEW',
  LEARNING = 'LEARNING',
  MASTERED = 'MASTERED',
}

@Entity({ tableName: 'topic_words' })
@Unique({ properties: ['topic', 'wordSenseId'] })
export class TopicWordOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => TopicOrmEntity)
  @Index()
  topic!: TopicOrmEntity;

  @Property({ type: 'uuid' })
  @Index()
  wordSenseId!: string;

  @Property({ type: 'string', default: WordLearningStatus.NEW })
  status: WordLearningStatus = WordLearningStatus.NEW;

  @Property({ type: 'datetime' })
  addedAt: Date = new Date();

  constructor(topic: TopicOrmEntity, wordSenseId: string) {
    this.topic = topic;
    this.wordSenseId = wordSenseId;
  }
}
