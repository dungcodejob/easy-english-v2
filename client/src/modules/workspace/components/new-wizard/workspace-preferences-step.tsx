import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import { Switch } from '@/shared/ui/shadcn/switch';
import { Controller, useForm } from 'react-hook-form';

import { WorkspaceLearningMode } from '../../types';
import { WizardStepLayout } from '../wizard-step-layout';

interface WorkspacePreferencesStepProps {
  defaultValues: Partial<CreateWorkspaceWizardData>;
  onNext: (data: Partial<CreateWorkspaceWizardData>) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function WorkspacePreferencesStep({
  defaultValues,
  onNext,
  onBack,
  onSkip,
}: WorkspacePreferencesStepProps) {
  const { register, control, handleSubmit } = useForm<
    Partial<CreateWorkspaceWizardData>
  >({
    defaultValues: {
      dailyTarget: defaultValues.dailyTarget || 10,
      studyReminder: defaultValues.studyReminder || false,
      defaultLearningMode:
        defaultValues.defaultLearningMode || WorkspaceLearningMode.Flashcard,
    },
  });

  const onSubmit = (data: Partial<CreateWorkspaceWizardData>) => {
    onNext(data);
  };

  return (
    <WizardStepLayout
      title="Preferences"
      description="Customize your learning habit. You can change these later."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Daily Target */}
        <div className="space-y-3">
          <Label htmlFor="dailyTarget">Daily Word Target</Label>
          <div className="flex items-center gap-4">
            <Input
              id="dailyTarget"
              type="number"
              min={1}
              max={100}
              className="w-24"
              {...register('dailyTarget', { valueAsNumber: true })}
            />
            <span className="text-sm text-muted-foreground">words per day</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended: 10-20 words for steady progress.
          </p>
        </div>

        {/* Study Reminder */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Study Reminders</Label>
            <div className="text-sm text-muted-foreground">
              Receive daily notifications to keep your streak.
            </div>
          </div>
          <Controller
            control={control}
            name="studyReminder"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Learning Mode */}
        <div className="space-y-3">
          <Label>Default Learning Mode</Label>
          <Controller
            control={control}
            name="defaultLearningMode"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WorkspaceLearningMode.Flashcard}>
                    Flashcards (Visual)
                  </SelectItem>
                  <SelectItem value={WorkspaceLearningMode.Quiz}>
                    Quiz (Multiple Choice)
                  </SelectItem>
                  <SelectItem value={WorkspaceLearningMode.SpacedRepetition}>
                    Spaced Repetition (Smart)
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            This will be the default view when you start a review session.
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onSkip}>
              Skip
            </Button>
            <Button type="submit">Review setup</Button>
          </div>
        </div>
      </form>
    </WizardStepLayout>
  );
}
