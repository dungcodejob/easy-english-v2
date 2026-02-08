import type { WorkspaceLearningGoal } from './workspace-learning-goal.enum';
import type { WorkspaceLearningLevel } from './workspace-learning-level.enum';
import type { WorkspaceLearningMode } from './workspace-learning-mode.enum';
import type { WorkspaceType } from './workspace-type.enum';

export enum Language {
  EN = 'EN',
  VI = 'VI',
  ES = 'ES',
  FR = 'FR',
  DE = 'DE',
  JA = 'JA',
  KO = 'KO',
  ZH = 'ZH',
}

export interface Workspace {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  type: WorkspaceType;
  language: Language;
  learningGoal: WorkspaceLearningGoal;
  level: WorkspaceLearningLevel;
  dailyTarget: number;
  studyReminder: boolean;
  defaultLearningMode: WorkspaceLearningMode;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  type: WorkspaceType;
  language: Language;
  learningGoal: WorkspaceLearningGoal;
  level: WorkspaceLearningLevel;
  dailyTarget: number;
  studyReminder: boolean;
  defaultLearningMode: WorkspaceLearningMode;
}

export type CreateWorkspaceWizardData = CreateWorkspaceRequest;

export interface CheckHasWorkspaceResponse {
  hasWorkspace: boolean;
  count: number;
}
