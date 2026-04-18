/**
 * WorkspaceBasicsStep — Clarion step 1 "Workspace Details"
 */

import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';
import {
  ClarionButton,
  ClarionInput,
  ClarionLabel,
  ClarionTextarea,
} from '@/shared/ui/base';
import { WizardStepShell } from '@/shared/ui/patterns';
import { cn } from '@/shared/utils';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Info,
  User,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { WorkspaceType } from '../../types';

interface WorkspaceBasicsStepProps {
  defaultValues: Partial<CreateWorkspaceWizardData>;
  onNext: (data: Partial<CreateWorkspaceWizardData>) => void;
  onBack?: () => void;
}

const TYPE_OPTIONS = [
  {
    value: WorkspaceType.Personal,
    label: 'Personal',
    description: 'For your own learning',
    icon: User,
  },
  {
    value: WorkspaceType.Team,
    label: 'Team',
    description: 'Collaborate with peers',
    icon: Briefcase,
  },
  {
    value: WorkspaceType.Classroom,
    label: 'Classroom',
    description: 'For teachers & students',
    icon: GraduationCap,
  },
];

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

  return (
    <WizardStepShell
      eyebrow="Step 01 — Identity"
      title={
        <>
          Begin your{' '}
          <em className="text-primary italic font-normal">scholarly</em>{' '}
          journey.
        </>
      }
      description="Define the space where your linguistic mastery will grow. This is the foundation of your curated learning environment."
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit(onNext)} className="space-y-10">
        <div className="max-w-xl bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-[0_12px_32px_rgba(26,27,30,0.06)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-1 bg-gradient-to-r from-transparent to-tertiary-fixed-dim/40" />

          <div className="space-y-10">
            {/* Workspace Name */}
            <div>
              <ClarionLabel
                htmlFor="name"
                className="uppercase tracking-wide text-on-surface-variant mb-2"
              >
                Workspace Name
              </ClarionLabel>
              <ClarionInput
                id="name"
                autoFocus
                placeholder="e.g. Mandarin Morning Sanctuary"
                className={cn(
                  errors.name &&
                    'border-destructive aria-invalid:border-destructive',
                )}
                {...register('name', {
                  required: 'Workspace name is required',
                })}
              />
              {errors.name ? (
                <p className="mt-2 text-sm text-destructive font-medium animate-in slide-in-from-top-1 fade-in-0">
                  {errors.name.message}
                </p>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <Info className="size-3.5" />
                  This will be the title of your study dashboard.
                </p>
              )}
            </div>

            {/* Workspace Type */}
            <div>
              <ClarionLabel className="uppercase tracking-wide text-on-surface-variant mb-4">
                Workspace Type
              </ClarionLabel>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TYPE_OPTIONS.map(
                      ({ value, label, description, icon: Icon }) => {
                        const active = field.value === value;
                        return (
                          <button
                            type="button"
                            key={value}
                            onClick={() => field.onChange(value)}
                            className={cn(
                              'group flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all',
                              active
                                ? 'border-primary bg-primary/5'
                                : 'border-outline-variant/30 bg-surface-container-low hover:border-primary/30',
                            )}
                          >
                            <Icon
                              className={cn(
                                'size-5 transition-colors',
                                active ? 'text-primary' : 'text-secondary',
                              )}
                            />
                            <span className="font-headline font-semibold text-sm">
                              {label}
                            </span>
                            <span className="text-xs text-on-surface-variant">
                              {description}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              />
            </div>

            {/* Description */}
            <div>
              <ClarionLabel
                htmlFor="description"
                className="uppercase tracking-wide text-on-surface-variant mb-2"
              >
                Description{' '}
                <span className="text-outline-variant italic font-normal normal-case">
                  (Optional)
                </span>
              </ClarionLabel>
              <ClarionTextarea
                id="description"
                rows={3}
                placeholder="Briefly define your learning goals..."
                className="bg-transparent rounded-none border-0 border-b-2 border-outline-variant/30 px-0 py-3 font-headline text-lg focus:ring-0 focus:border-secondary"
                {...register('description')}
              />
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
          <ClarionButton
            variant="ghost-back"
            onClick={onBack}
            leftIcon={<ArrowLeft />}
          >
            Return to Selection
          </ClarionButton>
          <ClarionButton
            type="submit"
            variant="primary"
            rightIcon={<ArrowRight />}
          >
            Continue to Language Focus
          </ClarionButton>
        </div>
      </form>
    </WizardStepShell>
  );
}
