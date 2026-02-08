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
import { WizardStepBasics } from './wizard-step-basics';
import { WizardStepContext } from './wizard-step-context';
import { WizardStepPreferences } from './wizard-step-preferences';
import { WizardStepReview } from './wizard-step-review';

export const WorkspaceWizard = () => {
  const step = useWizardStep();
  const { setStep } = useWizardActions();
  const wizardData = useWizardData();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    // Validate necessary fields here or inside Step3 if needed,
    // though the wizard allows free navigation usually, final check is good.
    // Ensure data is complete before submitting
    // Since types are Partial in store, we need to cast or ensure they exist.
    // For now assuming the wizard flow ensures completeness or defaults are set.
    createWorkspace(wizardData as CreateWorkspaceRequest);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <WizardStepBasics onNext={handleNext} />;
      case 2:
        return <WizardStepContext onNext={handleNext} onBack={handleBack} />;
      case 3:
        return (
          <WizardStepPreferences onNext={handleNext} onBack={handleBack} />
        );
      case 4:
        return (
          <WizardStepReview
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
