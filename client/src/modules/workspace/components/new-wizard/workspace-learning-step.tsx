import { LanguagePicker } from '@/modules/workspace/components/language-picker';
import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';

import { Button } from '@/shared/ui/shadcn/button';
import { Label } from '@/shared/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/shadcn/radio-group';
import { Controller, useForm } from 'react-hook-form';
import { WorkspaceLearningGoal, WorkspaceLearningLevel } from '../../types';
import { WizardStepLayout } from '../wizard-step-layout';

interface WorkspaceLearningStepProps {
  defaultValues: Partial<CreateWorkspaceWizardData>;
  onNext: (data: Partial<CreateWorkspaceWizardData>) => void;
  onBack: () => void;
}

export function WorkspaceLearningStep({
  defaultValues,
  onNext,
  onBack,
}: WorkspaceLearningStepProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Partial<CreateWorkspaceWizardData>>({
    defaultValues: {
      language: defaultValues.language || undefined, // Must be explicitly selected
      learningGoal:
        defaultValues.learningGoal || WorkspaceLearningGoal.Vocabulary,
      level: defaultValues.level || WorkspaceLearningLevel.Beginner,
    },
  });

  const onSubmit = (data: Partial<CreateWorkspaceWizardData>) => {
    onNext(data);
  };

  return (
    <WizardStepLayout
      title="Learning Context"
      description="Tell us what you want to learn so we can tailor the experience."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Language Selection */}
        <div className="space-y-3">
          <Label>
            Target Language <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="language"
            rules={{ required: 'Please select a language' }}
            render={({ field }) => (
              <div className="space-y-2">
                <LanguagePicker value={field.value} onChange={field.onChange} />
                {errors.language && (
                  <p className="text-sm text-destructive font-medium animate-in slide-in-from-top-1 fade-in-0">
                    {errors.language.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Learning Goal */}
        <div className="space-y-3">
          <Label>Main Goal</Label>
          <Controller
            control={control}
            name="learningGoal"
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={WorkspaceLearningGoal.Vocabulary}
                    id="goal-vocab"
                  />
                  <Label
                    htmlFor="goal-vocab"
                    className="font-normal cursor-pointer"
                  >
                    Build Vocabulary
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={WorkspaceLearningGoal.ExamPrep}
                    id="goal-exam"
                  />
                  <Label
                    htmlFor="goal-exam"
                    className="font-normal cursor-pointer"
                  >
                    Exam Preparation (IELTS, TOEIC, etc.)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={WorkspaceLearningGoal.DailyPractice}
                    id="goal-daily"
                  />
                  <Label
                    htmlFor="goal-daily"
                    className="font-normal cursor-pointer"
                  >
                    Daily Practice & Habit Building
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {/* Level Selection */}
        <div className="space-y-3">
          <Label>Current Proficiency</Label>
          <Controller
            control={control}
            name="level"
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value={WorkspaceLearningLevel.Beginner}
                    id="level-beginner"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="level-beginner"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-center h-full"
                  >
                    <span className="font-semibold">Beginner</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      A1 - A2
                    </span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value={WorkspaceLearningLevel.Intermediate}
                    id="level-intermediate"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="level-intermediate"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-center h-full"
                  >
                    <span className="font-semibold">Intermediate</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      B1 - B2
                    </span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value={WorkspaceLearningLevel.Advanced}
                    id="level-advanced"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="level-advanced"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-center h-full"
                  >
                    <span className="font-semibold">Advanced</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      C1 - C2
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" size="lg">
            Next Step
          </Button>
        </div>
      </form>
    </WizardStepLayout>
  );
}
