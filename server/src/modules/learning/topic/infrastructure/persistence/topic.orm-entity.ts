import {
  Cascade,
  Collection,
  Entity,
  Index,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { TopicWordOrmEntity } from './topic-word.orm-entity';

@Entity({ tableName: 'topics' })
export class TopicOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  @Property({ type: 'uuid' })
  @Index()
  userId!: string;

  @Property({ length: 100 })
  name!: string;

  @Property({ length: 500, nullable: true })
  description?: string;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(
    () => TopicWordOrmEntity,
    (topicWord: TopicWordOrmEntity) => topicWord.topic,
    {
      cascade: [Cascade.ALL],
      orphanRemoval: true,
    },
  )
  words = new Collection<TopicWordOrmEntity>(this);

  constructor(
    tenantId: string,
    userId: string,
    name: string,
    description?: string,
  ) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.name = name;
    this.description = description;
  }
}
