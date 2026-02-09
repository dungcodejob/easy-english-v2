import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/shadcn/radio-group';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { cn } from '@/shared/utils';
import { Briefcase, GraduationCap, User } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { WorkspaceType } from '../../types';
import { WizardStepLayout } from '../wizard-step-layout';

interface WorkspaceBasicsStepProps {
  defaultValues: Partial<CreateWorkspaceWizardData>;
  onNext: (data: Partial<CreateWorkspaceWizardData>) => void;
  onBack?: () => void;
}

export function WorkspaceBasicsStep({
  defaultValues,
  onNext,
  onBack,
}: WorkspaceBasicsStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Partial<CreateWorkspaceWizardData>>({
    defaultValues: {
      name: defaultValues.name || '',
      type: defaultValues.type || WorkspaceType.Personal,
      description: defaultValues.description || '',
    },
  });

  const onSubmit = (data: Partial<CreateWorkspaceWizardData>) => {
    onNext(data);
  };

  return (
    <WizardStepLayout
      title="Let's start with the basics"
      description="Give your workspace a name and choose how you'll use it."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Workspace Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. My English Journey"
              autoFocus
              className={cn(
                errors.name &&
                  'border-destructive focus-visible:ring-destructive',
              )}
              {...register('name', { required: 'Workspace name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive font-medium mt-1 animate-in slide-in-from-top-1 fade-in-0">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Workspace Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="type-personal"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <RadioGroupItem
                      value={WorkspaceType.Personal}
                      id="type-personal"
                      className="sr-only"
                    />
                    <User className="mb-3 h-6 w-6 text-muted-foreground" />
                    <div className="text-center">
                      <div className="font-semibold mb-1">Personal</div>
                      <div className="text-xs text-muted-foreground">
                        For your own learning
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="type-team"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <RadioGroupItem
                      value={WorkspaceType.Team}
                      id="type-team"
                      className="sr-only"
                    />
                    <Briefcase className="mb-3 h-6 w-6 text-muted-foreground" />

                    <div className="text-center">
                      <div className="font-semibold mb-1">Team</div>
                      <div className="text-xs text-muted-foreground">
                        Collaborate with peers
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="type-classroom"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <RadioGroupItem
                      value={WorkspaceType.Classroom}
                      id="type-classroom"
                      className="sr-only"
                    />
                    <GraduationCap className="mb-3 h-6 w-6 text-muted-foreground" />
                    <div className="text-center">
                      <div className="font-semibold mb-1">Classroom</div>
                      <div className="text-xs text-muted-foreground">
                        For teachers & students
                      </div>
                    </div>
                  </Label>
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What is this workspace for?"
              className="resize-none min-h-[80px]"
              {...register('description')}
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            Next Step
          </Button>
        </div>
      </form>
    </WizardStepLayout>
  );
}
