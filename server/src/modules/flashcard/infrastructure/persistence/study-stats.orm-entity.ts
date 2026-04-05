import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'study_stats' })
export class StudyStatsOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  @Property({ type: 'uuid' })
  @Index()
  userId!: string;

  @Property({ default: 0 })
  currentStreak!: number;

  @Property({ default: 0 })
  longestStreak!: number;

  @Property({ default: 0 })
  totalCardsReviewed!: number;

  @Property({ default: 0 })
  totalStudyTimeMinutes!: number;

  @Property({ default: 0 })
  masteredCards!: number;

  @Property({ type: 'datetime', nullable: true })
  lastStudyDate?: Date;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, userId: string) {
    this.tenantId = tenantId;
    this.userId = userId;
  }
}
