import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn/card';
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useCreateWorkspace } from '../../hooks/use-create-workspace';
import {
  defaultWizardPreferences,
  useWizardActions,
  useWizardData,
  useWizardStep,
} from '../../stores/use-wizard-store';
import type { CreateWorkspaceRequest } from '../../types/workspace.types';
import { WizardProgressBar } from '../wizard-progress-bar';
import { WorkspaceBasicsStep } from './workspace-basics-step';
import { WorkspaceLearningStep } from './workspace-learning-step';
import { WorkspacePreferencesStep } from './workspace-preferences-step';
import { WorkspaceReviewStep } from './workspace-review-step';

export const WorkspaceWizard = () => {
  const step = useWizardStep();
  const { setStep, updateData } = useWizardActions();
  const wizardData = useWizardData();
  const { mutate: createWorkspace, isPending, isError } = useCreateWorkspace();
  const navigate = useNavigate();

  const handleNext = (data: Partial<CreateWorkspaceRequest>) => {
    updateData(data);
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);
  const handleSkip = () => {
    updateData(defaultWizardPreferences);
    setStep(step + 1);
  };
  const handleCancel = () => navigate({ to: '/' });

  const handleSubmit = () => {
    createWorkspace(wizardData as CreateWorkspaceRequest);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <WorkspaceBasicsStep
            defaultValues={wizardData}
            onNext={handleNext}
            onBack={handleCancel}
          />
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
            isError={isError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl overflow-hidden">
        <CardHeader>
          <CardTitle>Create Your Workspace</CardTitle>
          <div className="pt-2">
            <WizardProgressBar currentStep={step} totalSteps={4} />
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};
