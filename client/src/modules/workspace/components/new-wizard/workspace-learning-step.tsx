/**
 * WorkspaceLearningStep — Clarion step 2 "Language Focus"
 *
 * Asymmetric bento language grid + proficiency segmented control +
 * learning-goal radio cards.
 */

import type { CreateWorkspaceWizardData } from '@/modules/workspace/types/workspace.types';
import { Language } from '@/modules/workspace/types/workspace.types';
import { ClarionButton } from '@/shared/ui/base';
import { WizardStepShell } from '@/shared/ui/patterns';
import { cn } from '@/shared/utils';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Palette,
  School,
  Star,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { WorkspaceLearningGoal, WorkspaceLearningLevel } from '../../types';

interface Props {
  defaultValues: Partial<CreateWorkspaceWizardData>;
  onNext: (data: Partial<CreateWorkspaceWizardData>) => void;
  onBack: () => void;
}

const LANGUAGES: Array<{
  value: Language;
  flag: string;
  label: string;
  blurb: string;
  featured?: boolean;
  tagline?: string;
}> = [
  {
    value: Language.FR,
    flag: '🇫🇷',
    label: 'French',
    blurb: 'Le Français — The language of diplomacy and philosophy.',
    featured: true,
    tagline: 'Currently Popular',
  },
  {
    value: Language.JA,
    flag: '🇯🇵',
    label: 'Japanese',
    blurb: 'Modern commerce & classic literature.',
  },
  {
    value: Language.DE,
    flag: '🇩🇪',
    label: 'German',
    blurb: 'Technical precision and engineering.',
  },
  {
    value: Language.VI,
    flag: '🇻🇳',
    label: 'Vietnamese',
    blurb: 'Rich tonal history and culture.',
  },
  {
    value: Language.ES,
    flag: '🇪🇸',
    label: 'Spanish',
    blurb: 'Vibrant global communication.',
  },
];

const GOALS = [
  {
    value: WorkspaceLearningGoal.Vocabulary,
    title: 'Academic Researcher',
    description: 'Focus on peer-reviewed articles and formal syntax.',
    icon: School,
    tone: 'primary',
  },
  {
    value: WorkspaceLearningGoal.ExamPrep,
    title: 'Professional Business',
    description: 'Networking, reporting, and executive communication.',
    icon: BookOpen,
    tone: 'secondary',
  },
  {
    value: WorkspaceLearningGoal.DailyPractice,
    title: 'Creative Arts',
    description: 'Exploration of literature, art history, and poetry.',
    icon: Palette,
    tone: 'tertiary',
  },
] as const;

const LEVELS: Array<{
  value: WorkspaceLearningLevel;
  label: string;
}> = [
  { value: WorkspaceLearningLevel.Beginner, label: 'Beginner' },
  { value: WorkspaceLearningLevel.Intermediate, label: 'Intermediate' },
  { value: WorkspaceLearningLevel.Advanced, label: 'Advanced' },
];

export function WorkspaceLearningStep({
  defaultValues,
  onNext,
  onBack,
}: Props) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Partial<CreateWorkspaceWizardData>>({
    defaultValues: {
      language: defaultValues.language || undefined,
      learningGoal:
        defaultValues.learningGoal || WorkspaceLearningGoal.Vocabulary,
      level: defaultValues.level || WorkspaceLearningLevel.Beginner,
    },
  });

  return (
    <WizardStepShell
      eyebrow="Step 02 — Contextualization"
      title={<>Define Your Learning Context</>}
      description="Select the linguistic landscape and workspace environment that best supports your current academic goals."
    >
      <form onSubmit={handleSubmit(onNext)} className="space-y-16">
        {/* Language Grid — bento layout */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl font-semibold text-primary">
              Target Language
            </h2>
            <span className="text-on-primary-fixed-variant text-sm font-medium">
              {LANGUAGES.length} languages available
            </span>
          </div>
          <Controller
            control={control}
            name="language"
            rules={{ required: 'Please select a language' }}
            render={({ field }) => (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {LANGUAGES.map((lang, idx) => {
                    const active = field.value === lang.value;
                    if (lang.featured) {
                      return (
                        <button
                          type="button"
                          key={lang.value}
                          onClick={() => field.onChange(lang.value)}
                          className={cn(
                            'md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-6 md:p-8 text-left flex flex-col justify-between transition-all hover:shadow-xl',
                            active && 'ring-4 ring-tertiary-fixed-dim/60',
                          )}
                        >
                          {active && (
                            <CheckCircle2
                              className="absolute top-5 right-5 size-7 text-tertiary-fixed-dim"
                              fill="currentColor"
                              strokeWidth={1.5}
                            />
                          )}
                          <div>
                            <span className="text-4xl mb-4 block">
                              {lang.flag}
                            </span>
                            <h3 className="text-3xl font-bold text-on-primary mb-2 font-headline">
                              {lang.label}
                            </h3>
                            <p className="text-primary-fixed/80 text-sm max-w-xs">
                              {lang.blurb}
                            </p>
                          </div>
                          {lang.tagline && (
                            <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase mt-8 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md text-on-primary">
                              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
                              {lang.tagline}
                            </div>
                          )}
                        </button>
                      );
                    }
                    return (
                      <button
                        type="button"
                        key={lang.value}
                        onClick={() => field.onChange(lang.value)}
                        style={{ animationDelay: `${idx * 40}ms` }}
                        className={cn(
                          'group p-6 rounded-xl text-left transition-all',
                          active
                            ? 'bg-primary/10 ring-2 ring-primary'
                            : 'bg-surface-container-low hover:bg-surface-container-high',
                        )}
                      >
                        <span className="text-2xl mb-4 block">{lang.flag}</span>
                        <h3 className="font-headline text-lg font-bold text-primary mb-1">
                          {lang.label}
                        </h3>
                        <p className="text-on-surface-variant text-xs leading-relaxed">
                          {lang.blurb}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {errors.language && (
                  <p className="mt-3 text-sm text-destructive font-medium animate-in slide-in-from-top-1 fade-in-0">
                    {errors.language.message}
                  </p>
                )}
              </>
            )}
          />
        </section>

        {/* Workspace focus + Proficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Workspace focus (learning goal radio cards) */}
          <section>
            <h2 className="font-headline text-xl font-semibold text-primary mb-6">
              Workspace Focus
            </h2>
            <Controller
              control={control}
              name="learningGoal"
              render={({ field }) => (
                <div className="space-y-3">
                  {GOALS.map(
                    ({ value, title, description, icon: Icon, tone }) => {
                      const active = field.value === value;
                      return (
                        <button
                          type="button"
                          key={value}
                          onClick={() => field.onChange(value)}
                          className={cn(
                            'group block w-full relative p-5 rounded-xl text-left bg-surface-container-lowest border transition-all',
                            active
                              ? 'border-primary shadow-md'
                              : 'border-outline-variant/20 hover:border-primary/30',
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
                                tone === 'primary' &&
                                  'bg-primary/5 text-primary',
                                tone === 'secondary' &&
                                  'bg-secondary/10 text-secondary',
                                tone === 'tertiary' &&
                                  'bg-tertiary-fixed-dim/20 text-on-tertiary-container',
                              )}
                            >
                              <Icon className="size-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="font-bold text-on-surface font-headline">
                                  {title}
                                </span>
                                <div
                                  className={cn(
                                    'w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0',
                                    active
                                      ? 'border-primary'
                                      : 'border-outline-variant',
                                  )}
                                >
                                  {active && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-on-surface-variant mt-1">
                                {description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            />
          </section>

          {/* Proficiency Level */}
          <section className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="font-headline text-xl font-semibold text-primary mb-2">
                Proficiency Level
              </h2>
              <p className="text-sm text-on-surface-variant mb-8">
                Choose your current comfort level with the target language.
              </p>
              <Controller
                control={control}
                name="level"
                render={({ field }) => (
                  <>
                    <div className="bg-surface-container-highest p-1 rounded-full flex items-center mb-8">
                      {LEVELS.map(({ value, label }) => {
                        const active = field.value === value;
                        return (
                          <button
                            type="button"
                            key={value}
                            onClick={() => field.onChange(value)}
                            className={cn(
                              'flex-1 py-3 px-2 rounded-full text-xs font-bold transition-all font-headline',
                              active
                                ? 'bg-surface-container-lowest shadow-sm text-primary'
                                : 'text-on-surface-variant hover:text-primary',
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim flex items-center justify-center text-on-tertiary-fixed shrink-0">
                        <Star className="size-4" fill="currentColor" />
                      </div>
                      <div>
                        <h4 className="font-headline text-sm font-bold text-on-surface">
                          Foundational Focus
                        </h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          We'll start with high-frequency nouns and essential
                          syntax structures used in real contexts.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <ClarionButton
            variant="ghost-back"
            onClick={onBack}
            leftIcon={<ArrowLeft />}
          >
            Back to Details
          </ClarionButton>
          <ClarionButton
            type="submit"
            variant="primary"
            rightIcon={<ArrowRight />}
          >
            Continue to Step 3
          </ClarionButton>
        </footer>
      </form>
    </WizardStepShell>
  );
}
