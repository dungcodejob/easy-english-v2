import {
  Language,
  LearningGoal,
  LearningMode,
  Level,
  WorkspaceType,
} from '../../domain/enums/workspace-enums';

export class WorkspaceResponseDto {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | undefined,
    readonly type: WorkspaceType,
    readonly language: Language,
    readonly learningGoal: LearningGoal,
    readonly level: Level,
    readonly dailyTarget: number,
    readonly studyReminder: boolean,
    readonly defaultLearningMode: LearningMode,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}
}
