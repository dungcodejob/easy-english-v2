import { Button } from '@/shared/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn/card';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { useWizardData } from '../../stores/use-wizard-store';

interface StepProps {
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const WizardStepReview = ({
  onBack,
  onSubmit,
  isSubmitting,
}: StepProps) => {
  const wizardData = useWizardData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace Summary</CardTitle>
          <CardDescription>
            Review your settings before creating your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Name</p>
              <p className="text-muted-foreground">{wizardData.name}</p>
            </div>
            <div>
              <p className="font-medium">Type</p>
              <p className="text-muted-foreground">{wizardData.type}</p>
            </div>
            <div>
              <p className="font-medium">Language</p>
              <p className="text-muted-foreground">{wizardData.language}</p>
            </div>
            <div>
              <p className="font-medium">Goal</p>
              <p className="text-muted-foreground">{wizardData.learningGoal}</p>
            </div>
            <div>
              <p className="font-medium">Level</p>
              <p className="text-muted-foreground">{wizardData.level}</p>
            </div>
            <div>
              <p className="font-medium">Daily Target</p>
              <p className="text-muted-foreground">
                {wizardData.dailyTarget} mins
              </p>
            </div>
            <div>
              <p className="font-medium">Reminders</p>
              <p className="text-muted-foreground">
                {wizardData.studyReminder ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <p className="font-medium">Mode</p>
              <p className="text-muted-foreground">
                {wizardData.defaultLearningMode}
              </p>
            </div>
          </div>
          {wizardData.description && (
            <div>
              <p className="font-medium text-sm">Description</p>
              <p className="text-sm text-muted-foreground">
                {wizardData.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting && <Spinner className="mr-2" />}
          Create Workspace
        </Button>
      </div>
    </div>
  );
};
