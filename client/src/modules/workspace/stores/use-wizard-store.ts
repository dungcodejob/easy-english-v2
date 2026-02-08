import { create } from 'zustand';
import {
  WorkspaceLearningGoal,
  WorkspaceLearningLevel,
  WorkspaceLearningMode,
  WorkspaceType,
} from '../types';
import {
  type CreateWorkspaceRequest,
  Language,
} from '../types/workspace.types';

export interface WizardState {
  step: number;
  data: Partial<CreateWorkspaceRequest>;
}

export interface WizardActions {
  setStep: (step: number) => void;
  updateData: (data: Partial<CreateWorkspaceRequest>) => void;
  reset: () => void;
}

const initialState: WizardState = {
  step: 1,
  data: {
    name: '',
    description: '',
    type: WorkspaceType.Personal,
    language: Language.EN,
    learningGoal: WorkspaceLearningGoal.DailyPractice,
    level: WorkspaceLearningLevel.Beginner,
    dailyTarget: 30,
    studyReminder: true,
    defaultLearningMode: WorkspaceLearningMode.Flashcard,
  },
};

export const useWizardStore = create<WizardState & WizardActions>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  updateData: (data) =>
    set((state) => ({
      data: { ...state.data, ...data },
    })),
  reset: () => set(initialState),
}));

export const useWizardStep = () => useWizardStore((state) => state.step);
export const useWizardData = () => useWizardStore((state) => state.data);
export const useWizardActions = () => {
  const setStep = useWizardStore((state) => state.setStep);
  const updateData = useWizardStore((state) => state.updateData);
  const reset = useWizardStore((state) => state.reset);
  return { setStep, updateData, reset };
};
