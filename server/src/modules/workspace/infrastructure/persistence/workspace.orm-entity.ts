import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import {
  Language,
  LearningGoal,
  LearningMode,
  Level,
  WorkspaceType,
} from '../../domain/enums/workspace-enums';

@Entity({ tableName: 'workspaces' })
export class WorkspaceOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'text' })
  tenantId!: string;

  @Property({ type: 'text' })
  userId!: string;

  @Property({ type: 'text' })
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Enum({ items: () => WorkspaceType, default: WorkspaceType.Personal })
  type!: WorkspaceType;

  @Enum({ items: () => Language })
  language!: Language;

  @Enum({ items: () => LearningGoal, default: LearningGoal.Vocabulary })
  learningGoal!: LearningGoal;

  @Enum({ items: () => Level, default: Level.Beginner })
  level!: Level;

  @Property({ type: 'integer', default: 10 })
  dailyTarget!: number;

  @Property({ type: 'boolean', default: false })
  studyReminder!: boolean;

  @Enum({
    items: () => LearningMode,
    default: LearningMode.Flashcard,
  })
  defaultLearningMode!: LearningMode;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
