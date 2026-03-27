import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { WordSenseOrmEntity } from 'src/modules/dictionary/infrastructure/persistence/word-sense.orm-entity';
import { ReviewRating } from 'src/modules/learning/progress/domain/value-objects/review-rating.vo';

import { StudySessionOrmEntity } from './study-session.orm-entity';

@Entity({ tableName: 'study_review_logs' })
@Unique({ properties: ['session', 'wordSense'] })
@Index({ properties: ['session'] })
@Index({ properties: ['userId', 'tenantId'] })
export class StudyReviewLogOrmEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => StudySessionOrmEntity)
  session!: StudySessionOrmEntity;

  @ManyToOne(() => WordSenseOrmEntity)
  wordSense!: WordSenseOrmEntity;

  @Property({ type: 'uuid' })
  @Index()
  userId!: string;

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  @Property({ type: 'int' })
  rating!: ReviewRating['value'];

  @Property({ type: 'int' })
  reviewDurationMs!: number;

  @Property()
  reviewedAt!: Date;

  @Property({ defaultRaw: 'now()' })
  createdAt: Date = new Date();
}
