import { AggregateRoot, CreateEntityProps } from '@core/ddd';
import { v7 } from 'uuid';
import {
  Language,
  LearningGoal,
  LearningMode,
  Level,
  WorkspaceType,
} from '../enums/workspace-enums';

export interface WorkspaceProps {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  type: WorkspaceType;
  language: Language;
  learningGoal: LearningGoal;
  level: Level;
  dailyTarget: number;
  studyReminder: boolean;
  defaultLearningMode: LearningMode;
}

export class WorkspaceEntity extends AggregateRoot {
  public tenantId: string;
  public userId: string;
  public name: string;
  public description?: string;
  public type: WorkspaceType;
  public language: Language;
  public learningGoal: LearningGoal;
  public level: Level;
  public dailyTarget: number;
  public studyReminder: boolean;
  public defaultLearningMode: LearningMode;

  private constructor(props: CreateEntityProps<WorkspaceProps>) {
    super({
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
    this.tenantId = props.tenantId;
    this.userId = props.userId;
    this.name = props.name;
    this.description = props.description;
    this.type = props.type;
    this.language = props.language;
    this.learningGoal = props.learningGoal;
    this.level = props.level;
    this.dailyTarget = props.dailyTarget;
    this.studyReminder = props.studyReminder;
    this.defaultLearningMode = props.defaultLearningMode;
  }

  static create(create: WorkspaceProps): WorkspaceEntity {
    const id = v7();
    const props: CreateEntityProps<WorkspaceProps> = {
      id,
      ...create,
    };
    const workspace = new WorkspaceEntity(props);
    return workspace;
  }

  static rehydrate(props: CreateEntityProps<WorkspaceProps>): WorkspaceEntity {
    return new WorkspaceEntity(props);
  }

  validate(): void {
    // Domain validation logic here if needed
  }
}
