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

  /** Note: status column was dropped — status is now derived at read time
   *  from UserWordSenseProgress.fsrsParams via TopicMapper.toResponse()
   */
  @Property({ type: 'datetime' })
  addedAt: Date = new Date();

  constructor(topic: TopicOrmEntity, wordSenseId: string) {
    this.topic = topic;
    this.wordSenseId = wordSenseId;
  }
}
