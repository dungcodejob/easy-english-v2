import type { CreateWorkspaceWizardData } from '@/modules/workspace/services/workspace.types';
import {
  Language,
  WorkspaceLearningGoal,
  WorkspaceLearningLevel,
} from '@/modules/workspace/services/workspace.types';
import { WizardStepShell } from '@/shared/ui/patterns';
import {
  BackButton,
  CTAButton,
  SegmentedControlItem,
} from '@/shared/ui/semantic';
import { cn } from '@/shared/utils';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Palette,
  School,
  Star,
} from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import type { FlagComponent } from 'country-flag-icons/react/3x2';
import { AnimatePresence, motion } from 'motion/react';
import { Controller, useForm } from 'react-hook-form';

interface Props {
  defaultValues: Partial<CreateWorkspaceWizardData>;
  onNext: (data: Partial<CreateWorkspaceWizardData>) => void;
  onBack: () => void;
}

interface LangOption {
  value: Language;
  flag: FlagComponent;
  label: string;
  blurb: string;
  tagline?: string;
}

const LANGUAGES: LangOption[] = [
  {
    value: Language.FR,
    flag: Flags.FR,
    label: 'French',
    blurb: 'Le Français — The language of diplomacy and philosophy.',
    tagline: 'Currently Popular',
  },
  {
    value: Language.JA,
    flag: Flags.JP,
    label: 'Japanese',
    blurb: 'Modern commerce & classic literature.',
  },
  {
    value: Language.DE,
    flag: Flags.DE,
    label: 'German',
    blurb: 'Technical precision and engineering.',
  },
  {
    value: Language.VI,
    flag: Flags.VN,
    label: 'Vietnamese',
    blurb: 'Rich tonal history and culture.',
  },
  {
    value: Language.ES,
    flag: Flags.ES,
    label: 'Spanish',
    blurb: 'Vibrant global communication.',
  },
];

const DEFAULT_FEATURED_LANGUAGE = Language.FR;

interface LanguageCardProps {
  lang: LangOption;
  isFeatured: boolean;
  onSelect: () => void;
}

function LanguageCard({ lang, isFeatured, onSelect }: LanguageCardProps) {
  const FlagIcon = lang.flag;
  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      whileTap={{ scale: isFeatured ? 0.97 : 0.95 }}
      transition={{
        layout: { type: 'spring', stiffness: 260, damping: 28 },
        default: { duration: 0.35 },
      }}
      className={cn(
        'group relative overflow-hidden rounded-xl text-left cursor-pointer',
        isFeatured
          ? 'md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary to-primary-container p-6 md:p-8 flex flex-col justify-between shadow-xl'
          : 'bg-surface-container-low hover:bg-surface-container-high p-6',
      )}
    >
      <AnimatePresence>
        {isFeatured && (
          <motion.span
            key="check-lg"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="absolute top-5 right-5"
          >
            <CheckCircle2
              className="size-7 text-tertiary-fixed-dim drop-shadow-lg"
              strokeWidth={2}
            />
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div layout="position">
        <motion.span
          layout
          className={cn(
            'block mb-4 overflow-hidden rounded-md shadow-md ring-1',
            isFeatured
              ? 'w-20 h-14 ring-white/30'
              : 'w-10 h-7 ring-outline-variant/30',
          )}
          animate={{ scale: [1, 1.08, 1], rotate: [0, isFeatured ? -4 : 4, 0] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          key={`flag-${isFeatured}`}
        >
          <FlagIcon className="w-full h-full object-cover" />
        </motion.span>

        <motion.h3
          layout="position"
          className={cn(
            'font-headline font-bold mb-2',
            isFeatured ? 'text-3xl text-white' : 'text-lg text-primary',
          )}
        >
          {lang.label}
        </motion.h3>
        <motion.p
          layout="position"
          className={cn(
            'leading-relaxed',
            isFeatured
              ? 'text-white/80 text-sm max-w-xs'
              : 'text-on-surface-variant text-xs',
          )}
        >
          {lang.blurb}
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {isFeatured && lang.tagline && (
          <motion.div
            key="tagline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase mt-8 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md text-white"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {lang.tagline}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

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
      language: defaultValues.language || DEFAULT_FEATURED_LANGUAGE,
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
            render={({ field }) => {
              const selected = field.value ?? DEFAULT_FEATURED_LANGUAGE;
              const ordered = [...LANGUAGES].sort((a, b) => {
                if (a.value === selected) return -1;
                if (b.value === selected) return 1;
                return 0;
              });
              return (
                <>
                  <motion.div
                    layout
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {ordered.map((lang) => (
                      <LanguageCard
                        key={lang.value}
                        lang={lang}
                        isFeatured={lang.value === selected}
                        onSelect={() => field.onChange(lang.value)}
                      />
                    ))}
                  </motion.div>
                  {errors.language && (
                    <p className="mt-3 text-sm text-destructive font-medium animate-in slide-in-from-top-1 fade-in-0">
                      {errors.language.message}
                    </p>
                  )}
                </>
              );
            }}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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
                      {LEVELS.map(({ value, label }) => (
                        <SegmentedControlItem
                          key={value}
                          isActive={field.value === value}
                          onClick={() => field.onChange(value)}
                        >
                          {label}
                        </SegmentedControlItem>
                      ))}
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

        <footer className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <BackButton onClick={onBack}>Back to Details</BackButton>
          <CTAButton type="submit" endIcon={<ArrowRight />}>
            Continue to Step 3
          </CTAButton>
        </footer>
      </form>
    </WizardStepShell>
  );
}
