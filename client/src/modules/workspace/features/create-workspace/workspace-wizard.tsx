import {
  AnimatedStep,
  DEFAULT_WIZARD_STEPS,
  WizardLayout,
} from '@/shared/ui/patterns';
import { useCreateWorkspace } from './use-create-workspace';
import {
  defaultWizardPreferences,
  useWizardActions,
  useWizardData,
} from '../../stores/use-wizard-store';
import type { CreateWorkspaceRequest } from '../../services/workspace.types';
import { WorkspaceBasicsStep } from './workspace-basics-step';
import { WorkspaceLearningStep } from './workspace-learning-step';
import { WorkspacePreferencesStep } from './workspace-preferences-step';
import { WorkspaceReviewStep } from './workspace-review-step';

export const WorkspaceWizard = () => {
  const { step, formData } = useWizardData();
  const { setStep, updateData } = useWizardActions();
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
    createWorkspace(formData as CreateWorkspaceRequest);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <WorkspaceBasicsStep
            defaultValues={formData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 1:
        return (
          <WorkspaceLearningStep
            defaultValues={formData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <WorkspacePreferencesStep
            defaultValues={formData}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 3:
        return (
          <WorkspaceReviewStep
            data={formData}
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
    <WizardLayout steps={DEFAULT_WIZARD_STEPS} currentStep={step}>
      <AnimatedStep key={step}>{renderStep()}</AnimatedStep>
    </WizardLayout>
  );
};
