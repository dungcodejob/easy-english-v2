import type { ObjectValues } from '@/shared/utils';

export const WorkspaceType = {
  Personal: 'Personal',
  Team: 'Team',
  Classroom: 'Classroom',
} as const;

export type WorkspaceType = ObjectValues<typeof WorkspaceType>;

const WorkspaceTypeLabels: Record<WorkspaceType, string> = {
  [WorkspaceType.Personal]: 'Personal',
  [WorkspaceType.Team]: 'Team',
  [WorkspaceType.Classroom]: 'Classroom',
};

export const WorkspaceTypeOptions = Object.values(WorkspaceType).map(
  (value) => ({
    value,
    label: WorkspaceTypeLabels[value],
  }),
);

export const getWorkspaceTypeLabel = (type: WorkspaceType) => {
  return WorkspaceTypeLabels[type];
};

export const WorkspaceLearningGoal = {
  Vocabulary: 'Vocabulary',
  ExamPrep: 'ExamPrep',
  DailyPractice: 'DailyPractice',
} as const;

export type WorkspaceLearningGoal = ObjectValues<typeof WorkspaceLearningGoal>;

const WorkspaceLearningGoalLabels: Record<WorkspaceLearningGoal, string> = {
  [WorkspaceLearningGoal.Vocabulary]: 'Vocabulary',
  [WorkspaceLearningGoal.ExamPrep]: 'Exam Prep',
  [WorkspaceLearningGoal.DailyPractice]: 'Daily Practice',
};

export const WorkspaceLearningGoalOptions = Object.values(
  WorkspaceLearningGoal,
).map((value) => ({
  value,
  label: WorkspaceLearningGoalLabels[value],
}));

export const getWorkspaceLearningGoalLabel = (goal: WorkspaceLearningGoal) => {
  return WorkspaceLearningGoalLabels[goal];
};

export const WorkspaceLearningLevel = {
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
} as const;

export type WorkspaceLearningLevel = ObjectValues<
  typeof WorkspaceLearningLevel
>;

const WorkspaceLearningLevelLabels: Record<WorkspaceLearningLevel, string> = {
  [WorkspaceLearningLevel.Beginner]: 'Beginner',
  [WorkspaceLearningLevel.Intermediate]: 'Intermediate',
  [WorkspaceLearningLevel.Advanced]: 'Advanced',
};

export const WorkspaceLearningLevelOptions = Object.values(
  WorkspaceLearningLevel,
).map((value) => ({
  value,
  label: WorkspaceLearningLevelLabels[value],
}));

export const getWorkspaceLearningLevelLabel = (
  level: WorkspaceLearningLevel,
) => {
  return WorkspaceLearningLevelLabels[level];
};

export const WorkspaceLearningMode = {
  Flashcard: 'Flashcard',
  Quiz: 'Quiz',
  SpacedRepetition: 'SpacedRepetition',
} as const;

export type WorkspaceLearningMode = ObjectValues<typeof WorkspaceLearningMode>;

const WorkspaceLearningModeLabels: Record<WorkspaceLearningMode, string> = {
  [WorkspaceLearningMode.Flashcard]: 'Flashcard',
  [WorkspaceLearningMode.Quiz]: 'Quiz',
  [WorkspaceLearningMode.SpacedRepetition]: 'Spaced Repetition',
};

export const WorkspaceLearningModeOptions = Object.values(
  WorkspaceLearningMode,
).map((value) => ({
  value,
  label: WorkspaceLearningModeLabels[value],
}));

export const getWorkspaceLearningModeLabel = (mode: WorkspaceLearningMode) => {
  return WorkspaceLearningModeLabels[mode];
};

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
