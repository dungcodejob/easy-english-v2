/**
 * WorkspacePreferencesStep — Clarion step 3 "Learning Pace"
 *
 * Daily target slider + study reminder toggle + learning mode picker
 * (4 asymmetric cards, Smart AI highlighted).
 */

import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';
import { ClarionButton } from '@/shared/ui/base';
import { WizardStepShell } from '@/shared/ui/patterns';
import { cn } from '@/shared/utils';
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Layers,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { WorkspaceLearningMode } from '../../types';

interface Props {
  defaultValues: Partial<CreateWorkspaceWizardData>;
  onNext: (data: Partial<CreateWorkspaceWizardData>) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function WorkspacePreferencesStep({
  defaultValues,
  onNext,
  onBack,
  onSkip,
}: Props) {
  const { control, handleSubmit } = useForm<Partial<CreateWorkspaceWizardData>>(
    {
      defaultValues: {
        dailyTarget: defaultValues.dailyTarget ?? 25,
        studyReminder: defaultValues.studyReminder ?? true,
        defaultLearningMode:
          defaultValues.defaultLearningMode || WorkspaceLearningMode.Flashcard,
      },
    },
  );

  return (
    <WizardStepShell
      eyebrow="Step 03 — Rhythm"
      title={
        <>
          Design Your
          <br />
          <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Daily Rhythm.
          </span>
        </>
      }
      description="Success in language learning isn't about intensity; it's about consistency. Tailor your study environment to fit your life."
    >
      <form onSubmit={handleSubmit(onNext)} className="space-y-10">
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: slider + reminder */}
          <div className="md:col-span-7 space-y-6">
            {/* Daily Target */}
            <Controller
              control={control}
              name="dailyTarget"
              render={({ field }) => (
                <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_12px_32px_rgba(26,27,30,0.06)]">
                  <div className="flex justify-between items-end mb-6 gap-4">
                    <div>
                      <h3 className="font-headline text-xl font-bold text-on-surface mb-1">
                        Daily Target
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        How many words per day?
                      </p>
                    </div>
                    <span className="font-headline text-3xl font-extrabold text-secondary leading-none">
                      {field.value}{' '}
                      <span className="text-sm font-medium text-on-surface-variant uppercase tracking-widest">
                        words
                      </span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={field.value ?? 25}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer clarion-range"
                  />
                  <div className="flex justify-between mt-4 text-[11px] font-bold text-outline uppercase tracking-tighter">
                    <span>Casual</span>
                    <span>Balanced</span>
                    <span>Intense</span>
                  </div>
                </div>
              )}
            />

            {/* Reminder Toggle */}
            <Controller
              control={control}
              name="studyReminder"
              render={({ field }) => (
                <div className="bg-surface-container-low p-6 md:p-8 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                      <BellRing className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface">
                        Study Reminder
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        Gentle nudges to keep your streak
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!field.value}
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      'relative w-14 h-7 rounded-full transition-colors shrink-0',
                      field.value
                        ? 'bg-secondary'
                        : 'bg-surface-container-highest',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 start-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
                        field.value && 'translate-x-7',
                      )}
                    />
                  </button>
                </div>
              )}
            />
          </div>

          {/* Right: Mode selection */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <h3 className="font-headline text-xs font-bold text-on-surface-variant uppercase tracking-widest px-2">
              Learning Mode
            </h3>
            <Controller
              control={control}
              name="defaultLearningMode"
              render={({ field }) => (
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => field.onChange(WorkspaceLearningMode.Quiz)}
                    className={cn(
                      'relative group text-left p-6 rounded-xl bg-surface-container-lowest transition-all border-2',
                      field.value === WorkspaceLearningMode.Quiz
                        ? 'border-secondary shadow-md'
                        : 'border-transparent hover:bg-surface-container-low',
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <ListChecks className="size-7 text-on-surface-variant group-hover:text-primary transition-colors" />
                      {field.value === WorkspaceLearningMode.Quiz && (
                        <CheckCircle2
                          className="size-5 text-secondary"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <h4 className="font-headline font-bold text-lg text-on-surface mb-1">
                      Quiz
                    </h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Test your recall under pressure.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      field.onChange(WorkspaceLearningMode.Flashcard)
                    }
                    className={cn(
                      'relative group text-left p-6 rounded-xl bg-surface-container-lowest transition-all border-2',
                      field.value === WorkspaceLearningMode.Flashcard
                        ? 'border-secondary shadow-md'
                        : 'border-transparent hover:bg-surface-container-low',
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Layers className="size-7 text-on-surface-variant group-hover:text-primary transition-colors" />
                      {field.value === WorkspaceLearningMode.Flashcard && (
                        <CheckCircle2
                          className="size-5 text-secondary"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <h4 className="font-headline font-bold text-lg text-on-surface mb-1">
                      Flashcard
                    </h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Spaced repetition for deep memorization.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      field.onChange(WorkspaceLearningMode.SpacedRepetition)
                    }
                    className={cn(
                      'relative overflow-hidden group text-left p-6 rounded-xl bg-primary text-on-primary shadow-xl transition-all border-2',
                      field.value === WorkspaceLearningMode.SpacedRepetition
                        ? 'border-tertiary-fixed-dim'
                        : 'border-transparent',
                    )}
                  >
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-container/50 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative flex justify-between items-start mb-4">
                      <Sparkles className="size-7 text-tertiary-fixed-dim" />
                      <span className="text-[10px] font-bold bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Recommended
                      </span>
                    </div>
                    <h4 className="relative font-headline font-bold text-lg mb-1">
                      Smart AI
                    </h4>
                    <p className="relative text-sm text-primary-fixed-dim leading-relaxed">
                      Adaptive learning that evolves with you.
                    </p>
                  </button>
                </div>
              )}
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-outline-variant/10 flex items-center justify-between gap-4 flex-wrap">
          <ClarionButton
            variant="ghost-back"
            onClick={onBack}
            leftIcon={<ArrowLeft />}
          >
            Back to Focus
          </ClarionButton>
          <div className="flex items-center gap-3">
            <ClarionButton
              variant="ghost-back"
              onClick={onSkip}
              className="text-on-surface-variant hover:text-primary"
            >
              Skip for now
            </ClarionButton>
            <ClarionButton
              type="submit"
              variant="primary"
              rightIcon={<ArrowRight />}
            >
              Continue to Final Step
            </ClarionButton>
          </div>
        </footer>
      </form>

      {/* Range thumb style */}
      <style>{`
        .clarion-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px; height: 24px;
          background: #002046;
          border: 4px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,32,70,0.2);
        }
        .clarion-range::-moz-range-thumb {
          width: 24px; height: 24px;
          background: #002046;
          border: 4px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,32,70,0.2);
        }
      `}</style>
    </WizardStepShell>
  );
}
