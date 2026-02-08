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
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useWizardActions, useWizardData } from '../../stores/use-wizard-store';
import {
  Language,
  LearningGoal,
  LearningMode,
  Level,
} from '../../types/workspace.types';

const step2Schema = z.object({
  language: z.enum(Language),
  learningGoal: z.enum(LearningGoal),
  level: z.enum(Level),
  dailyTarget: z.number().min(1, 'Daily target must be at least 1 minute'),
  studyReminder: z.boolean(),
  defaultLearningMode: z.enum(LearningMode),
});

type Step2FormValues = z.infer<typeof step2Schema>;

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export const Step2LearningPreferences = ({ onNext, onBack }: Step2Props) => {
  const { updateData } = useWizardActions();
  const wizardData = useWizardData();

  const { control, handleSubmit } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      language: wizardData.language || Language.EN,
      learningGoal: wizardData.learningGoal || LearningGoal.DAILY_PRACTICE,
      level: wizardData.level || Level.BEGINNER,
      dailyTarget: wizardData.dailyTarget || 30,
      studyReminder: wizardData.studyReminder || true,
      defaultLearningMode:
        wizardData.defaultLearningMode || LearningMode.FLASHCARD,
    },
  });

  const onSubmit = (data: Step2FormValues) => {
    updateData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            control={control}
            name="language"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Target Language</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Language).map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
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

          <Controller
            control={control}
            name="level"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Current Level</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Level).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
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
          name="learningGoal"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Primary Goal</FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select Goal" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(LearningGoal).map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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
