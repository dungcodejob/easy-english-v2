import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';
import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { CheckCircle2 } from 'lucide-react';
import { WizardStepLayout } from '../wizard-step-layout';

interface WorkspaceReviewStepProps {
  data: Partial<CreateWorkspaceWizardData>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function WorkspaceReviewStep({
  data,
  onBack,
  onSubmit,
  isSubmitting,
}: WorkspaceReviewStepProps) {
  return (
    <WizardStepLayout
      title="Review & Create"
      description="Everything look good? Ready to start your learning journey."
    >
      <div className="space-y-6">
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Workspace
                </div>
                <div className="text-lg font-semibold">{data.name}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {data.type} Workspace
                </div>
              </div>
              {data.description && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                    Description
                  </div>
                  <div className="text-sm">{data.description}</div>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Learning
                </div>
                <div className="font-semibold uppercase">{data.language}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {data.level} Level
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Goal
                </div>
                <div className="capitalize">
                  {data.learningGoal?.replace('_', ' ')}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Daily Target
                </div>
                <div>{data.dailyTarget} words</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Reminders
                </div>
                <div>{data.studyReminder ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Mode
                </div>
                <div className="capitalize">
                  {data.defaultLearningMode?.replace('_', ' ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={onSubmit}
            size="lg"
            disabled={isSubmitting}
            className="w-full md:w-auto min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Create Workspace
              </>
            )}
          </Button>
        </div>
      </div>
    </WizardStepLayout>
  );
}
