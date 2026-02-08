import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn/card';
import { useCreateWorkspace } from '../../hooks/use-create-workspace';
import {
  useWizardActions,
  useWizardData,
  useWizardStep,
} from '../../stores/use-wizard-store';
import type { CreateWorkspaceRequest } from '../../types/workspace.types';
import { WorkspaceBasicsStep } from './workspace-basics-step';
import { WorkspaceLearningStep } from './workspace-learning-step';
import { WorkspacePreferencesStep } from './workspace-preferences-step';
import { WorkspaceReviewStep } from './workspace-review-step';

export const WorkspaceWizard = () => {
  const step = useWizardStep();
  const { setStep, updateData } = useWizardActions();
  const wizardData = useWizardData();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();

  const handleNext = (data: Partial<CreateWorkspaceRequest>) => {
    updateData(data);
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);
  const handleSkip = () => setStep(step + 1);

  const handleSubmit = () => {
    createWorkspace(wizardData as CreateWorkspaceRequest);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <WorkspaceBasicsStep defaultValues={wizardData} onNext={handleNext} />
        );
      case 2:
        return (
          <WorkspaceLearningStep
            defaultValues={wizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <WorkspacePreferencesStep
            defaultValues={wizardData}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 4:
        return (
          <WorkspaceReviewStep
            data={wizardData}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Your Workspace - Step {step} of 4</CardTitle>
          {/* Add a progress bar here if needed */}
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>
    </div>
  );
};
