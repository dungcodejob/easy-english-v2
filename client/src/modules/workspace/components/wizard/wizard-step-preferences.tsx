import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/shared/ui/shadcn/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/shadcn/field';
import { Input } from '@/shared/ui/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import { Switch } from '@/shared/ui/shadcn/switch';
import { useWizardActions, useWizardData } from '../../stores/use-wizard-store';
import { LearningMode } from '../../types/workspace.types';

const stepSchema = z.object({
  dailyTarget: z.coerce.number().min(1),
  studyReminder: z.boolean(),
  defaultLearningMode: z.nativeEnum(LearningMode),
});

type StepFormValues = z.infer<typeof stepSchema>;

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export const WizardStepPreferences = ({ onNext, onBack }: StepProps) => {
  const { updateData } = useWizardActions();
  const wizardData = useWizardData();

  const { control, handleSubmit } = useForm<StepFormValues>({
    resolver: zodResolver(stepSchema) as any,
    defaultValues: {
      dailyTarget: wizardData.dailyTarget || 30,
      studyReminder: wizardData.studyReminder !== false, // Default to true
      defaultLearningMode:
        wizardData.defaultLearningMode || LearningMode.FLASHCARD,
    },
  });

  const onSubmit = (data: StepFormValues) => {
    updateData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            control={control}
            name="dailyTarget"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Daily Target (minutes)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={1}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="defaultLearningMode"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Preferred Mode</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LearningMode).map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="studyReminder"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-row items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-0.5">
                <FieldLabel htmlFor={field.name} className="text-base">
                  Study Reminders
                </FieldLabel>
                <div className="text-sm text-muted-foreground">
                  Receive notifications to keep up with your daily target.
                </div>
              </div>
              <Switch
                id={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Next: Review</Button>
        </div>
      </FieldGroup>
    </form>
  );
};
