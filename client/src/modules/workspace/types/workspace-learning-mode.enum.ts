import type { ObjectValues } from '@/shared/utils';

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
