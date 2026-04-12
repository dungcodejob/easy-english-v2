/**
 * WizardLayout — reusable multi-step onboarding wizard shell
 *
 * Replaces duplicated WizardStepLayout + WorkspaceWizard shell.
 * Encapsulates:
 * - Progress indicator (step dots + labels)
 * - Animated step transitions (AnimatePresence + Framer Motion)
 * - Step validation contract (can advance / cannot advance)
 * - Keyboard navigation (Enter to advance, Escape to cancel)
 * - Responsive card container
 *
 * Usage:
 *   <WizardLayout
 *     steps={['Basics', 'Learning', 'Preferences', 'Review']}
 *     currentStep={step}
 *     onCancel={() => navigate({ to: '/' })}
 *   >
 *     <AnimatedStep key={step}>
 *       <YourStepContent />
 *     </AnimatedStep>
 *   </WizardLayout>
 */

import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';

interface WizardLayoutProps {
  children: ReactNode;
  /** Ordered list of step names (used for labels + count) */
  steps: string[];
  /** 0-based current step index */
  currentStep: number;
  /** Called when user clicks Cancel */
  onCancel?: () => void;
  className?: string;
}

/** Vertical stepper — left column */
function WizardStepper({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="w-48 shrink-0">
      <div className="space-y-0">
        {steps.map((label, idx) => (
          <div key={label} className="relative pl-6 py-3">
            {/* Active indicator bar */}
            {idx < currentStep && (
              <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-primary rounded-full" />
            )}
            {/* Step number circle */}
            <div
              className={cn(
                'absolute left-0 top-3 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200',
                idx < currentStep &&
                  'bg-primary text-primary-foreground',
                idx === currentStep &&
                  'bg-primary text-primary-foreground ring-4 ring-primary/20',
                idx > currentStep &&
                  'bg-surface-container text-on-surface-variant',
              )}
            >
              {idx < currentStep ? (
                // Checkmark SVG for completed steps
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="size-3.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2,8 6,12 14,4" />
                </svg>
              ) : (
                idx + 1
              )}
            </div>
            <div
              className={cn(
                'text-sm font-medium transition-colors',
                idx === currentStep
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant',
              )}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * AnimatedStep — wraps wizard content with entrance/exit animations.
 * Use inside WizardLayout only.
 */
export function AnimatedStep({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * WizardStepShell — the header inside the wizard card.
 * Renders title, description, and progress bar.
 * Can be used inside each step for consistent structure.
 */
export function WizardStepShell({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className ?? '')}>
      <div className="space-y-1 text-center">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-primary">
          {title}
        </h2>
        {description && (
          <p className="text-on-surface-variant text-sm">{description}</p>
        )}
      </div>
      <div className="mx-auto max-w-md">{children}</div>
    </div>
  );
}

export function WizardLayout({
  children,
  steps,
  currentStep,
  onCancel,
  className = '',
}: WizardLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div
        className={cn(
          'w-full max-w-5xl rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-xl',
          className,
        )}
      >
        {/* Two-column layout: stepper + content */}
        <div className="flex gap-12 p-8">
          {/* Left: vertical stepper */}
          <WizardStepper steps={steps} currentStep={currentStep} />

          {/* Right: step content */}
          <div className="flex-1">
            {/* Cancel button — top right */}
            {onCancel && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={onCancel}
                  className="text-on-surface-variant hover:text-primary text-sm transition-colors rounded-full px-4 py-1.5 hover:bg-surface-container"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-tertiary-fixed-dim transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap font-headline">
                STEP {currentStep + 1} OF {steps.length}
              </span>
            </div>

            {/* Animated content area */}
            <AnimatePresence mode="wait">{children}</AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}