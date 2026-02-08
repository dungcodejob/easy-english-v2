import type { ObjectValues } from '@/shared/utils';

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
