import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { WordSenseOrmEntity } from '../../../dictionary/infrastructure/persistence/word-sense.orm-entity';

@Entity({ tableName: 'user_word_sense_progress' })
@Unique({ properties: ['userId', 'wordSense'] })
@Index({ properties: ['userId', 'archivedAt'] })
export class UserWordSenseProgressOrmEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => WordSenseOrmEntity)
  @Index()
  wordSense!: WordSenseOrmEntity;

  @Property({ default: 0 })
  masteryLevel!: number;

  @Property({ default: 0 })
  reviewCount!: number;

  @Property({ defaultRaw: 'now()' })
  nextReviewAt!: Date;

  @Property({ nullable: true })
  lastReviewedAt!: Date | null;

  @Property({ nullable: true })
  archivedAt!: Date | null;

  @Property({ defaultRaw: 'now()' })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), defaultRaw: 'now()' })
  updatedAt: Date = new Date();
}
