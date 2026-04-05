import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { WordSenseOrmEntity } from 'src/modules/dictionary/infrastructure/persistence/word-sense.orm-entity';

@Entity({ tableName: 'user_word_sense_progress' })
@Unique({ properties: ['userId', 'wordSense'] })
@Index({ properties: ['userId', 'archivedAt'] })
export class UserWordSenseProgressOrmEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'uuid' })
  @Index()
  userId!: string;

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  @ManyToOne(() => WordSenseOrmEntity)
  @Index()
  wordSense!: WordSenseOrmEntity;

  // ── Legacy FSRS transition columns ──────────────────────────────────────────
  // Derived from _fsrsParams during Phase 4; removed in Phase 5 cleanup.
  @Property({ default: 0 })
  masteryLevel!: number;

  @Property({ default: 0 })
  reviewCount!: number;

  @Property({ defaultRaw: 'now()' })
  nextReviewAt!: Date;

  @Property({ nullable: true })
  lastReviewedAt!: Date | null;

  // ── New FSRS columns ────────────────────────────────────────────────────────
  // Source of truth from Phase 4 onwards.
  @Property({ type: 'float', default: 0 })
  stability!: number;

  @Property({ type: 'float', default: 0 })
  difficulty!: number;

  @Property({ type: 'int', default: 0 })
  lapses!: number;

  @Property({ type: 'int', default: 0 })
  reps!: number;

  @Property({ type: 'string', length: 20, default: 'new' })
  state!: string; // 'new' | 'learning' | 'review' | 'relearning' | 'grace'

  @Property({ type: 'datetime', nullable: true })
  dueDate!: Date | null;

  @Property({ type: 'datetime', nullable: true })
  lastReviewDate!: Date | null;

  // ── Standard timestamps ──────────────────────────────────────────────────────
  @Property({ nullable: true })
  archivedAt!: Date | null;

  @Property({ defaultRaw: 'now()' })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), defaultRaw: 'now()' })
  updatedAt: Date = new Date();
}
