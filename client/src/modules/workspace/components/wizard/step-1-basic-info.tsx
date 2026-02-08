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
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useWizardActions, useWizardData } from '../../stores/use-wizard-store';
import { WorkspaceType } from '../../types/workspace.types';

const step1Schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  type: z.nativeEnum(WorkspaceType),
});

type Step1FormValues = z.infer<typeof step1Schema>;

interface Step1Props {
  onNext: () => void;
}

export const Step1BasicInfo = ({ onNext }: Step1Props) => {
  const { updateData } = useWizardActions();
  const wizardData = useWizardData();

  const { control, handleSubmit } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: wizardData.name || '',
      description: wizardData.description || '',
      type: wizardData.type || WorkspaceType.PERSONAL,
    },
  });

  const onSubmit = (data: Step1FormValues) => {
    updateData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
              <FieldLabel htmlFor={field.name}>
                Description (Optional)
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Briefly describe your workspace..."
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="type"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Workspace Type</FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WorkspaceType.PERSONAL}>
                    Personal
                  </SelectItem>
                  <SelectItem value={WorkspaceType.TEAM}>Team</SelectItem>
                  <SelectItem value={WorkspaceType.CLASSROOM}>
                    Classroom
                  </SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Next: Learning Preferences</Button>
        </div>
      </FieldGroup>
    </form>
  );
};
