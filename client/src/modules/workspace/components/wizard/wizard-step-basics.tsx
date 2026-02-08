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
import { useWizardActions, useWizardData } from '../../stores/use-wizard-store';

const stepSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters'),
  description: z.string().optional(),
});

type StepFormValues = z.infer<typeof stepSchema>;

interface StepProps {
  onNext: () => void;
}

export const WizardStepBasics = ({ onNext }: StepProps) => {
  const { updateData } = useWizardActions();
  const wizardData = useWizardData();

  const { control, handleSubmit } = useForm<StepFormValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      name: wizardData.name || '',
      description: wizardData.description || '',
    },
  });

  const onSubmit = (data: StepFormValues) => {
    updateData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Workspace Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="My Awesome Workspace"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Input
                {...field}
                id={field.name}
                value={field.value || ''}
                aria-invalid={fieldState.invalid}
                placeholder="Describe your workspace..."
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Next: Context</Button>
        </div>
      </FieldGroup>
    </form>
  );
};
