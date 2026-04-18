/**
 * WorkspaceReviewStep — Clarion step 4 "Finalize"
 *
 * Editorial bento summary grid: hero identity card + language focus
 * + pace/intensity card + glass action bar.
 */

import { defaultWizardPreferences } from '@/modules/workspace/stores/use-wizard-store';
import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';
import { ClarionButton } from '@/shared/ui/base';
import { WizardStepShell } from '@/shared/ui/patterns';
import { cn } from '@/shared/utils';
import {
  ArrowLeft,
  BellRing,
  CheckCircle2,
  FileEdit,
  Gauge,
  Languages,
  Sparkles,
  Target,
} from 'lucide-react';

interface Props {
  data: Partial<CreateWorkspaceWizardData>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isError: boolean;
}

export function WorkspaceReviewStep({
  data,
  onBack,
  onSubmit,
  isSubmitting,
  isError,
}: Props) {
  const dailyTarget = data.dailyTarget ?? 0;
  const intensityPct = Math.min(100, (dailyTarget / 100) * 100);
  const intensityLabel =
    dailyTarget < 15 ? 'Gentle' : dailyTarget < 45 ? 'Standard' : 'Scholarly';

  return (
    <WizardStepShell
      eyebrow={
        <>
          <span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
            READY TO SYNC
          </span>
        </>
      }
      title={
        <>
          Review your <br />
          <span className="text-secondary">scholarly sanctuary.</span>
        </>
      }
      description="Verify the parameters of your new learning environment before we initialize your personalized curriculum."
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Hero identity card — span 8 */}
        <div className="md:col-span-8 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 md:p-10 text-on-primary relative min-h-[240px] flex flex-col justify-end">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-fixed-dim mb-3 block">
              {data.type ?? 'Personal'} Workspace
            </span>
            <h3 className="font-headline text-3xl md:text-4xl font-bold mb-2 leading-tight">
              {data.name || 'Untitled Workspace'}
            </h3>
            {data.description && (
              <p className="text-primary-fixed/80 max-w-lg">
                {data.description}
              </p>
            )}
          </div>
        </div>

        {/* Identity small card */}
        <div className="md:col-span-4 p-6 md:p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-[0_12px_32px_rgba(26,27,30,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <FileEdit className="size-5 text-secondary" />
            <ClarionButton variant="edit">EDIT</ClarionButton>
          </div>
          <h4 className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest mb-1">
            Identity
          </h4>
          <p className="font-headline text-xl font-bold text-on-surface mb-4 capitalize">
            {data.type ?? 'Personal'}
          </p>
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <Target className="size-4" />
            <span>{data.learningGoal?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Language focus card */}
        <div className="md:col-span-6 p-6 md:p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-[0_12px_32px_rgba(26,27,30,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="size-5 text-tertiary-fixed-dim" />
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                Focus Language
              </span>
            </div>
            <ClarionButton variant="edit">EDIT</ClarionButton>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-headline text-3xl font-bold text-on-surface">
                {data.language ?? '—'}
              </p>
              <p className="text-on-surface-variant font-medium capitalize">
                {data.learningGoal?.replace('_', ' ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                Level
              </p>
              <p className="text-lg font-bold text-secondary capitalize">
                {data.level ?? 'Beginner'}
              </p>
            </div>
          </div>
        </div>

        {/* Pace card */}
        <div className="md:col-span-6 p-6 md:p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-[0_12px_32px_rgba(26,27,30,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="size-5 text-primary-fixed-dim" />
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                Pace & Intensity
              </span>
            </div>
            <ClarionButton variant="edit">EDIT</ClarionButton>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Daily target</span>
              <span className="font-bold text-on-surface">
                {dailyTarget} words
                {dailyTarget === defaultWizardPreferences.dailyTarget && (
                  <span className="text-xs text-on-surface-variant ml-2 font-normal">
                    (Default)
                  </span>
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary-fixed-dim rounded-full transition-all duration-700"
                style={{ width: `${intensityPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-medium text-on-surface-variant">
              <span
                className={cn(
                  intensityLabel === 'Gentle' && 'text-tertiary font-bold',
                )}
              >
                Gentle
              </span>
              <span
                className={cn(
                  intensityLabel === 'Standard' && 'text-tertiary font-bold',
                )}
              >
                Standard
              </span>
              <span
                className={cn(
                  intensityLabel === 'Scholarly' && 'text-tertiary font-bold',
                )}
              >
                Scholarly
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2 text-sm text-on-surface-variant">
              <BellRing className="size-4" />
              Reminders{' '}
              {data.studyReminder ? (
                <span className="text-secondary font-medium">enabled</span>
              ) : (
                <span>disabled</span>
              )}{' '}
              · Mode:{' '}
              <span className="capitalize font-medium text-on-surface">
                {data.defaultLearningMode?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Glass action bar */}
        <div className="md:col-span-12 mt-4">
          <div className="bg-surface-container-low/60 backdrop-blur-xl p-6 md:p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/15">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <Sparkles className="size-5 text-on-secondary-container" />
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface">
                  {isError
                    ? 'Something went wrong — give it another try.'
                    : 'Everything looks perfect!'}
                </p>
                <p className="text-sm text-on-surface-variant">
                  By clicking finalize, your academic paths will be generated.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <ClarionButton
                variant="ghost-back"
                onClick={onBack}
                disabled={isSubmitting}
                leftIcon={<ArrowLeft />}
              >
                Back
              </ClarionButton>
              <ClarionButton
                variant="primary"
                onClick={onSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
                loadingLabel="Finalizing..."
                leftIcon={!isSubmitting ? <CheckCircle2 /> : undefined}
              >
                {isError ? 'Retry Finalize' : 'Finalize Workspace'}
              </ClarionButton>
            </div>
          </div>
        </div>
      </div>
    </WizardStepShell>
  );
}
