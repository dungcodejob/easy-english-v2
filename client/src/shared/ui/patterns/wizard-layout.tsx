/**
 * WizardLayout — Clarion setup wizard shell
 *
 * Editorial sidebar layout: fixed sidebar with icon-labeled steps
 * (amber active rule) + wide main content area for hero header + forms.
 *
 * Usage:
 *   <WizardLayout steps={WIZARD_STEPS} currentStep={step}>
 *     <AnimatedStep key={step}><StepContent /></AnimatedStep>
 *   </WizardLayout>
 */

import { cn } from '@/shared/utils';
import { CheckCircle2, FileEdit, Gauge, Languages } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ComponentType, ReactNode } from 'react';

export interface WizardStep {
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface WizardLayoutProps {
  children: ReactNode;
  steps: WizardStep[];
  currentStep: number;
  onCancel?: () => void;
  className?: string;
}

export const DEFAULT_WIZARD_STEPS: WizardStep[] = [
  { label: 'Workspace Details', icon: FileEdit },
  { label: 'Language Focus', icon: Languages },
  { label: 'Learning Pace', icon: Gauge },
  { label: 'Finalize', icon: CheckCircle2 },
];

function WizardSidebar({
  steps,
  currentStep,
}: {
  steps: WizardStep[];
  currentStep: number;
}) {
  return (
    <aside className="hidden md:flex flex-col py-8 px-4 h-screen w-64 bg-surface-container-low/60 sticky top-0 shrink-0">
      <div className="mb-10 px-4">
        <h2 className="font-headline text-lg font-bold text-primary">
          Setup Wizard
        </h2>
        <p className="text-sm text-on-surface-variant font-medium">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
      <nav className="space-y-2">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className={cn(
                'flex items-center gap-3 pl-4 py-2 font-headline transition-all duration-300',
                isActive &&
                  'text-primary font-bold border-l-4 border-tertiary-fixed-dim bg-surface-container/50 rounded-r-lg',
                isDone && 'text-on-primary-fixed-variant',
                !isActive && !isDone && 'text-outline-variant',
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="text-sm">{step.label}</span>
            </div>
          );
        })}
      </nav>
      <div className="mt-auto px-4">
        <div className="p-4 rounded-xl bg-tertiary-fixed/60">
          <p className="text-[10px] font-bold text-on-tertiary-fixed uppercase tracking-wider mb-1">
            Academic Tip
          </p>
          <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed">
            Your progress is automatically saved as you curate your scholarly
            sanctuary.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function AnimatedStep({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * WizardStepShell — editorial hero header for each step.
 *
 *   <WizardStepShell
 *     eyebrow="Step 01 — Identity"
 *     title={<>Begin your <em className="text-primary italic">scholarly</em> journey.</>}
 *     description="..."
 *   >
 *     {form}
 *   </WizardStepShell>
 */
export function WizardStepShell({
  eyebrow,
  title,
  description,
  children,
  className,
  maxWidth = 'max-w-4xl',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className={cn(maxWidth, 'mx-auto w-full', className)}>
      <header className="mb-12 relative">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none" />
        {eyebrow && (
          <span className="inline-block text-secondary font-medium tracking-widest text-[11px] uppercase mb-3">
            {eyebrow}
          </span>
        )}
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-on-primary-fixed tracking-tight mb-4 leading-[1.1]">
          {title}
        </h1>
        {description && (
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </header>
      {children}
    </div>
  );
}

export function WizardLayout({
  children,
  steps,
  currentStep,
  onCancel,
  className,
}: WizardLayoutProps) {
  return (
    <div className={cn('relative min-h-screen bg-surface', className)}>
      {/* Ambient background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex min-h-screen">
        <WizardSidebar steps={steps} currentStep={currentStep} />

        <main className="flex-1 px-6 py-10 md:px-12 lg:px-20 md:py-16">
          {onCancel && (
            <div className="flex justify-end mb-6">
              <button
                onClick={onCancel}
                className="text-on-surface-variant hover:text-primary text-sm transition-colors rounded-full px-4 py-1.5 hover:bg-surface-container"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Mobile progress bar */}
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-tertiary-fixed-dim transition-all duration-500"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap font-headline">
              STEP {currentStep + 1} / {steps.length}
            </span>
          </div>

          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </main>
      </div>
    </div>
  );
}
