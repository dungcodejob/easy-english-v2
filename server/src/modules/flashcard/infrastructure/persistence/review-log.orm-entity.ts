import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'review_logs' })
@Index({ properties: ['cardId'] })
@Index({ properties: ['userId', 'tenantId'] })
export class ReviewLogOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ type: 'uuid' })
  cardId!: string;

  @Property({ type: 'uuid' })
  userId!: string;

  @Property({ type: 'uuid' })
  tenantId!: string;

  @Property({ type: 'int' })
  rating!: number; // 1=Again, 2=Hard, 3=Good, 4=Easy

  @Property({ type: 'string', length: 50 })
  previousState!: string;

  @Property({ type: 'string', length: 50 })
  newState!: string;

  @Property({ type: 'float' })
  previousStability!: number;

  @Property({ type: 'float' })
  newStability!: number;

  @Property({ type: 'float' })
  previousDifficulty!: number;

  @Property({ type: 'float' })
  newDifficulty!: number;

  @Property({ type: 'int' })
  reviewDurationMs!: number;

  @Property({ type: 'datetime' })
  reviewedAt!: Date;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();
}
