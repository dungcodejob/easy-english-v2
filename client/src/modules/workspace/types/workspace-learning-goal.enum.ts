import type { ObjectValues } from '@/shared/utils';

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
