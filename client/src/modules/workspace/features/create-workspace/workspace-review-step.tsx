import { defaultWizardPreferences } from '@/modules/workspace/stores/use-wizard-store';
import type { CreateWorkspaceWizardData } from '@/modules/workspace/services/workspace.types';
import { WizardStepShell } from '@/shared/ui/patterns';
import { BackButton, CTAButton, InlineEditButton } from '@/shared/ui/semantic';
import { cn } from '@/shared/utils';
import {
  BellRing,
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
        <div className="md:col-span-8 overflow-hidden rounded-xl bg-surface-container-low relative group min-h-[260px]">
          <img
            alt="Workspace hero"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5uBMvJ_5qTAAwZSyin68PEJa6_gXVF6FH8XRDamaOAWW8ZfNYXLuoD4As14QR2rpXpwLCeSHOMrVVf_st7vM2G6GvIwTuuCVDzYws7M9hGV8tLAnzqWAM-P3yX_lHMhsCXNYeFoLEERJySyg0gkSpKifBH1Y8f454nnoRfGdWBatlf7zAZM6WrnIfh4hT6WxZ96Hc9XdhDLgghb35QtL06RnFXs2PnZe_NVnPa1dbGuDwGhyfAk_Hp1xFBhoDJyZV1l1e1nL2qYs"
            className="w-full h-64 min-h-[260px] object-cover opacity-80 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-transparent flex flex-col justify-end p-8 md:p-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-fixed-dim mb-3 block">
              {data.type ?? 'Personal'} Workspace
            </span>
            <h3 className="font-headline text-white text-3xl md:text-4xl font-bold mb-2 leading-tight">
              {data.name || 'Untitled Workspace'}
            </h3>
            {data.description && (
              <p className="text-white/80 max-w-lg text-sm">
                {data.description}
              </p>
            )}
          </div>
        </div>

        <div className="md:col-span-4 p-6 md:p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-[0_12px_32px_rgba(26,27,30,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <FileEdit className="size-5 text-secondary" />
            <InlineEditButton>Edit</InlineEditButton>
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

        <div className="md:col-span-6 p-6 md:p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-[0_12px_32px_rgba(26,27,30,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="size-5 text-tertiary-fixed-dim" />
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                Focus Language
              </span>
            </div>
            <InlineEditButton>Edit</InlineEditButton>
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

        <div className="md:col-span-6 p-6 md:p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-[0_12px_32px_rgba(26,27,30,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="size-5 text-primary-fixed-dim" />
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                Pace & Intensity
              </span>
            </div>
            <InlineEditButton>Edit</InlineEditButton>
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

        <section className="md:col-span-12 mt-12">
          <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-8 text-center">
            Initial Curriculum Preview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3 group">
              <div className="aspect-video rounded-xl overflow-hidden bg-surface-container-low grayscale group-hover:grayscale-0 transition-all duration-500">
                <img
                  alt="Module 1"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg4iwxOkAdhX6lGUS-AIdYzd4j7EnxXLTuUh5JCcXsuAX6PkIulbZGorj06jrgINA22LwRYBDBNi4sOgrTZFSI7ktOdKYfnq-_-tIJByFjcOdhGLQ7E3LIt7Bbz0Ek0bsMNTNbpD-Dd0LfKBNRtdxloJlIJfp6-VS-vWdRLLYGSG-1SKfuhlDwJS4ec8zD9hBSSw-JL436_3W_eU6LlmheLTfOBT93OEh2kc-TifIFXHQxlmr_gm53kbfdX6L87E5zRHA9J6cMrHs"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="text-[11px] font-bold text-secondary uppercase tracking-widest">
                Module 1
              </p>
              <h5 className="font-headline font-bold text-on-surface">
                Linguistic foundations
              </h5>
            </div>
            <div className="flex flex-col gap-3 group opacity-60">
              <div className="aspect-video rounded-xl overflow-hidden bg-surface-container-low grayscale">
                <img
                  alt="Module 2"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-_mWsGJD1nh1eQVgMyfdXzG8BmlnsucqOuTnHNOftNLyVxTb9PvPVHuAW49EZmo1cjsG-C_AFO68FajFmfMOMmyp-stTzSaB6yRkPYjMmQUb5FmYzuhzzNPJRtS8p-xN_MYdJMzBHPb0jmVi-xIMhZ-q1GKYF8Vw75etU30ZU9KgwPM2CzM9eKodc1xdSg4RIDt2xtuBNCiL8WxYY1cbw7PfNINAh7YB3C9sgLmgzlgfIMtv2WRGsHv168BXFzv7D5_SAvmmjZFs"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                Module 2
              </p>
              <h5 className="font-headline font-bold text-on-surface">
                Conversational context
              </h5>
            </div>
            <div className="flex flex-col gap-3 group opacity-40">
              <div className="aspect-video rounded-xl overflow-hidden bg-surface-container-low grayscale">
                <img
                  alt="Module 3"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRgnjevAfkNuF0JLyBWMFE0SrotA8yI5pzlUGt6HV2zAWG1BWohV_FLBEgRikBRYLrzT9I1W5z37ohbe1DAJU6ewr3I-342fj-rk1igatUuYbUxs5dPZA3N22l_4fCjFQjlTe3RkVgDp51M3C8vFdUBxhCVKUYVaMfe1O8PwbANqO9S9aSoTstE_vlw_MTEgmH5PS4HYJkvUH88pxRxobc16ZeQN6F6c6HgHDhNSJZD8L9m5YGG-ocXZZCqnjZucbYJ5YHNCI8"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                Module 3
              </p>
              <h5 className="font-headline font-bold text-on-surface">
                Advanced syntax
              </h5>
            </div>
          </div>
        </section>

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
              <BackButton onClick={onBack} disabled={isSubmitting}>
                Back
              </BackButton>
              <CTAButton
                onClick={onSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isError ? 'Retry Finalize' : 'Finalize Workspace'}
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </WizardStepShell>
  );
}
