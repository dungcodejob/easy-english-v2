/**
 * WorkspaceWizard — Onboarding flow root
 *
 * Uses WizardLayout (Design System pattern) instead of raw Card + CardContent.
 * Step management is delegated to the Zustand wizard store (useWizardStore).
 *
 * Responsibilities:
 * - Renders the correct step component based on currentStep
 * - Handles step transitions (next/back)
 * - Triggers createWorkspace on final step submission
 * - Navigates away on cancel
 */

import {
  AnimatedStep,
  WizardLayout,
} from '@/shared/ui/patterns';
import { useCreateWorkspace } from '../../hooks/use-create-workspace';
import {
  defaultWizardPreferences,
  useWizardActions,
  useWizardData,
  useWizardStep,
} from '../../stores/use-wizard-store';
import type { CreateWorkspaceRequest } from '../../types/workspace.types';
import { WorkspaceBasicsStep } from './workspace-basics-step';
import { WorkspaceLearningStep } from './workspace-learning-step';
import { WorkspacePreferencesStep } from './workspace-preferences-step';
import { WorkspaceReviewStep } from './workspace-review-step';

const WIZARD_STEPS = ['Basics', 'Learning', 'Preferences', 'Review'];

export const WorkspaceWizard = () => {
  const step = useWizardStep();
  const { setStep, updateData } = useWizardActions();
  const wizardData = useWizardData();
  const { mutate: createWorkspace, isPending, isError } = useCreateWorkspace();

  const handleNext = (data: Partial<CreateWorkspaceRequest>) => {
    updateData(data);
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSkip = () => {
    updateData(defaultWizardPreferences);
    setStep(step + 1);
  };

  const handleSubmit = () => {
    createWorkspace(wizardData as CreateWorkspaceRequest);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <WorkspaceBasicsStep
            defaultValues={wizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 1:
        return (
          <WorkspaceLearningStep
            defaultValues={wizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <WorkspacePreferencesStep
            defaultValues={wizardData}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 3:
        return (
          <WorkspaceReviewStep
            data={wizardData}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            isError={isError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WizardLayout
      steps={WIZARD_STEPS}
      currentStep={step}
    >
      <AnimatedStep key={step}>
        {renderStep()}
      </AnimatedStep>
    </WizardLayout>
  );
};
