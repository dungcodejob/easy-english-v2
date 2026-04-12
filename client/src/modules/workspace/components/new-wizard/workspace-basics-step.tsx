/**
 * WorkspaceBasicsStep — wizard step component
 *
 * Migrated to Design System:
 *  - WizardStepLayout  → WizardStepShell (DS pattern)
 *  - shadcn Button     → DsButton (DS base)
 *  - shadcn Input      → DsInput (DS base)
 *  - shadcn Label      → FieldLabel (DS shadcn wrapper)
 *
 * UI: 100% DS components. Business logic: unchanged.
 */

import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';
import { DsButton } from '@/shared/ui/base';
import { DsInput } from '@/shared/ui/base';
import { FieldLabel } from '@/shared/ui/shadcn/field';
import { Label } from '@/shared/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/shadcn/radio-group';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { WizardStepShell } from '@/shared/ui/patterns';
import { cn } from '@/shared/utils';
import { Briefcase, GraduationCap, User } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { WorkspaceType } from '../../types';

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
    <WizardStepShell
      title="Let's start with the basics"
      description="Give your workspace a name and choose how you'll use it."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FieldLabel htmlFor="name" className="text-sm font-medium">
            Workspace Name <span className="text-destructive">*</span>
          </FieldLabel>
          <DsInput
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
            <p className="text-sm text-destructive font-medium animate-in slide-in-from-top-1 fade-in-0">
              {errors.name.message}
            </p>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium">Workspace Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value={WorkspaceType.Personal}
                      id="type-personal"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="type-personal"
                      className="flex flex-col items-center justify-between rounded-2xl border-2 border-outline-variant/30 bg-surface-container p-4 hover:bg-surface-container-high cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 transition-all text-center h-full"
                    >
                      <User className="mb-3 h-6 w-6 text-secondary" />
                      <div className="text-center">
                        <div className="font-headline font-semibold mb-1">
                          Personal
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          For your own learning
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value={WorkspaceType.Team}
                      id="type-team"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="type-team"
                      className="flex flex-col items-center justify-between rounded-2xl border-2 border-outline-variant/30 bg-surface-container p-4 hover:bg-surface-container-high cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 transition-all text-center h-full"
                    >
                      <Briefcase className="mb-3 h-6 w-6 text-secondary" />
                      <div className="text-center">
                        <div className="font-headline font-semibold mb-1">
                          Team
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          Collaborate with peers
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value={WorkspaceType.Classroom}
                      id="type-classroom"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="type-classroom"
                      className="flex flex-col items-center justify-between rounded-2xl border-2 border-outline-variant/30 bg-surface-container p-4 hover:bg-surface-container-high cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 transition-all text-center h-full"
                    >
                      <GraduationCap className="mb-3 h-6 w-6 text-secondary" />
                      <div className="text-center">
                        <div className="font-headline font-semibold mb-1">
                          Classroom
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          For teachers & students
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="What is this workspace for?"
              className="resize-none min-h-[80px] bg-surface-container border-outline-variant/30 focus:border-primary"
              {...register('description')}
            />
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-outline-variant/20 mt-8">
          <DsButton
            type="button"
            variant="ghost"
            onClick={onBack}
            className="rounded-full border border-outline text-on-surface-variant hover:bg-surface-container"
          >
            Cancel
          </DsButton>
          <DsButton
            type="submit"
            className="bg-gradient-to-br from-primary to-primary-container text-primary-foreground rounded-full px-8 py-3 font-headline font-bold shadow-lg"
          >
            Next Step
          </DsButton>
        </div>
      </form>
    </WizardStepShell>
  );
}
