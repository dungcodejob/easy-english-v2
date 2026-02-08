import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Label } from '@/shared/ui/shadcn/label';
import { useWizardData } from '../../stores/use-wizard-store';

interface Step3Props {
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const Step3Review = ({ onBack, onSubmit, isSubmitting }: Step3Props) => {
  const data = useWizardData();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Review your Workspace</h3>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{data.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="font-medium">{data.type}</p>
              </div>

              <div className="col-span-2">
                <Label className="text-muted-foreground">Description</Label>
                <p className="font-medium">
                  {data.description || 'No description provided'}
                </p>
              </div>

              <div className="border-t col-span-2 my-2" />

              <div>
                <Label className="text-muted-foreground">Language</Label>
                <p className="font-medium">{data.language}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Goal</Label>
                <p className="font-medium">{data.learningGoal}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Level</Label>
                <p className="font-medium">{data.level}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Daily Target</Label>
                <p className="font-medium">{data.dailyTarget} minutes/day</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Mode</Label>
                <p className="font-medium">{data.defaultLearningMode}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Reminders</Label>
                <p className="font-medium">
                  {data.studyReminder ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Workspace'}
        </Button>
      </div>
    </div>
  );
};
