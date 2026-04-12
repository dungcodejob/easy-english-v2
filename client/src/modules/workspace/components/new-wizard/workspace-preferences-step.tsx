/**
 * WorkspacePreferencesStep — wizard step component
 *
 * Migrated to Design System:
 *  - WizardStepLayout  → WizardStepShell (DS pattern)
 *  - shadcn Button    → DsButton (DS base)
 *  - shadcn Input     → DsInput (DS base)
 *  - shadcn Select    → DsSelect (DS base, new)
 *  - shadcn Switch    → kept (complex controlled state)
 */

import { DsButton } from '@/shared/ui/base';
import { DsInput } from '@/shared/ui/base';
import { DsSelect, DsSelectItem } from '@/shared/ui/base';
import { FieldLabel } from '@/shared/ui/shadcn/field';
import { WizardStepShell } from '@/shared/ui/patterns';
import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';
import { Switch } from '@/shared/ui/shadcn/switch';
import { cn } from '@/shared/utils';
import { Controller, useForm } from 'react-hook-form';
import { WorkspaceLearningMode } from '../../types';

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
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<CreateWorkspaceWizardData>>({
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
    <WizardStepShell
      title="Preferences"
      description="Customize your learning habit. You can change these later."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Daily Target */}
        <div className="space-y-3">
          <FieldLabel htmlFor="dailyTarget" className="text-sm font-medium">
            Daily Word Target
          </FieldLabel>
          <div className="flex items-center gap-4">
            <DsInput
              id="dailyTarget"
              type="number"
              min={1}
              max={100}
              className={cn(
                'w-24',
                errors.dailyTarget &&
                  'border-destructive focus-visible:ring-destructive',
              )}
              autoFocus
              {...register('dailyTarget', {
                valueAsNumber: true,
                min: { value: 1, message: 'Minimum 1 word' },
                max: { value: 100, message: 'Maximum 100 words' },
              })}
            />
            <span className="text-sm text-on-surface-variant">
              words per day
            </span>
          </div>
          {errors.dailyTarget && (
            <p className="text-sm text-destructive font-medium animate-in slide-in-from-top-1 fade-in-0">
              {errors.dailyTarget.message}
            </p>
          )}
          <p className="text-xs text-on-surface-variant">
            Recommended: 10-20 words for steady progress.
          </p>
        </div>

        {/* Study Reminder */}
        <div className="flex flex-row items-center justify-between rounded-2xl border border-outline-variant/30 bg-surface-container p-5">
          <div className="space-y-0.5">
            <FieldLabel className="text-base font-medium font-headline">
              Study Reminders
            </FieldLabel>
            <div className="text-sm text-on-surface-variant">
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
          <FieldLabel className="text-sm font-medium">
            Default Learning Mode
          </FieldLabel>
          <Controller
            control={control}
            name="defaultLearningMode"
            render={({ field }) => (
              <DsSelect
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select mode"
              >
                <DsSelectItem value={WorkspaceLearningMode.Flashcard}>
                  Flashcards (Visual)
                </DsSelectItem>
                <DsSelectItem value={WorkspaceLearningMode.Quiz}>
                  Quiz (Multiple Choice)
                </DsSelectItem>
                <DsSelectItem value={WorkspaceLearningMode.SpacedRepetition}>
                  Spaced Repetition (Smart)
                </DsSelectItem>
              </DsSelect>
            )}
          />
          <p className="text-xs text-on-surface-variant">
            This will be the default view when you start a review session.
          </p>
        </div>

        <div className="flex justify-between pt-6 border-t border-outline-variant/20 mt-8">
          <DsButton
            type="button"
            variant="ghost"
            onClick={onBack}
            className="rounded-full border border-outline text-on-surface-variant hover:bg-surface-container"
          >
            Back
          </DsButton>
          <div className="flex gap-2">
            <DsButton
              type="button"
              variant="outline"
              onClick={onSkip}
              className="rounded-full border border-outline text-on-surface-variant hover:bg-surface-container"
            >
              Skip
            </DsButton>
            <DsButton
              type="submit"
              className="bg-gradient-to-br from-primary to-primary-container text-primary-foreground rounded-full px-8 py-3 font-headline font-bold shadow-lg"
            >
              Review setup
            </DsButton>
          </div>
        </div>
      </form>
    </WizardStepShell>
  );
}
