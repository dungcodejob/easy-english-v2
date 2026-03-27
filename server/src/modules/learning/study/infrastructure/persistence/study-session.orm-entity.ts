import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import {
  studySessionStatus,
  studySessionType,
  type StudySessionScope,
  type StudySessionStatus,
  type StudySessionType,
} from '../../domain/entities/study-session.entity';

@Entity({ tableName: 'study_sessions' })
@Index({ properties: ['userId', 'tenantId', 'status'] })
export class StudySessionOrmEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'uuid' })
  @Index()
  userId!: string;

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  @Property({ type: 'varchar', length: 20 })
  scope!: StudySessionScope;

  @Property({
    type: 'varchar',
    length: 20,
    default: studySessionType.Flashcard,
  })
  studyType!: StudySessionType;

  @Property({ type: 'uuid', nullable: true })
  topicId!: string | null;

  @Property({ type: 'jsonb' })
  enrolledCardIds!: string[];

  @Property({ type: 'int', default: 0 })
  reviewedCount!: number;

  @Property({ type: 'int', default: 0 })
  againCount!: number;

  @Property({ type: 'int', default: 0 })
  hardCount!: number;

  @Property({ type: 'int', default: 0 })
  goodCount!: number;

  @Property({ type: 'int', default: 0 })
  easyCount!: number;

  @Property({
    type: 'varchar',
    length: 20,
    default: studySessionStatus.InProgress,
  })
  status!: StudySessionStatus;

  @Property({ defaultRaw: 'now()' })
  startedAt!: Date;

  @Property({ nullable: true })
  completedAt!: Date | null;

  @Property({ nullable: true })
  abandonedAt!: Date | null;

  @Property({ defaultRaw: 'now()' })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), defaultRaw: 'now()' })
  updatedAt: Date = new Date();
}
