/**
 * WorkspaceReviewStep — wizard step component
 *
 * Migrated to Design System:
 *  - WizardStepLayout  → WizardStepShell (DS pattern)
 *  - shadcn Button    → DsButton (DS base) with isLoading prop
 *  - shadcn Spinner   → removed (isLoading handles this)
 */

import { DsButton } from '@/shared/ui/base';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Separator } from '@/shared/ui/shadcn/separator';
import { WizardStepShell } from '@/shared/ui/patterns';
import { CheckCircle2 } from 'lucide-react';
import { defaultWizardPreferences } from '@/modules/workspace/stores/use-wizard-store';
import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';

interface WorkspaceReviewStepProps {
  data: Partial<CreateWorkspaceWizardData>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isError: boolean;
}

export function WorkspaceReviewStep({
  data,
  onBack,
  onSubmit,
  isSubmitting,
  isError,
}: WorkspaceReviewStepProps) {
  return (
    <WizardStepShell
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
                <div>
                  {data.dailyTarget} words{' '}
                  {data.dailyTarget ===
                    defaultWizardPreferences.dailyTarget && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (Default)
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Reminders
                </div>
                <div>
                  {data.studyReminder ? 'Enabled' : 'Disabled'}{' '}
                  {data.studyReminder ===
                    defaultWizardPreferences.studyReminder && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (Default)
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Mode
                </div>
                <div className="capitalize">
                  {data.defaultLearningMode?.replace('_', ' ')}{' '}
                  {data.defaultLearningMode ===
                    defaultWizardPreferences.defaultLearningMode && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (Default)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <DsButton
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </DsButton>
          <DsButton
            onClick={onSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            loadingLabel="Creating workspace..."
            leftIcon={!isSubmitting ? <CheckCircle2 /> : undefined}
            className="w-full md:w-auto min-w-[150px]"
          >
            {isError ? 'Retry Create Workspace' : 'Create Workspace'}
          </DsButton>
        </div>
      </div>
    </WizardStepShell>
  );
}
