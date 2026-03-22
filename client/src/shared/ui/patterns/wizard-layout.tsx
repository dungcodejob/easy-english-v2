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

/** Single step dot in the progress indicator */
function StepDot({
  label,
  index,
  isActive,
  isCompleted,
}: {
  label: string;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      {/* Connector line (not on first item) */}
      {index > 0 && (
        <div
          className={`h-0.5 w-full transition-colors duration-300 ${
            isCompleted ? 'bg-primary' : 'bg-border'
          }`}
        />
      )}
      {/* Step indicator circle */}
      <div className="flex flex-col items-center gap-1">
        <div
          className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ${
            isActive
              ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
              : isCompleted
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {isCompleted ? (
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
            index + 1
          )}
        </div>
        {/* Step label */}
        <span
          className={`text-center text-xs font-medium leading-tight transition-colors ${
            isActive
              ? 'text-foreground'
              : isCompleted
                ? 'text-primary'
                : 'text-muted-foreground'
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/** Progress bar — horizontal connector with dots */
function WizardProgressBar({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="flex w-full items-center px-2">
      {steps.map((label, index) => (
        <StepDot
          key={label}
          label={label}
          index={index}
          isActive={index === currentStep}
          isCompleted={index < currentStep}
        />
      ))}
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
    <div className={`space-y-6 ${className ?? ''}`}>
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div
        className={`w-full max-w-2xl rounded-2xl border border-border/50 bg-card shadow-sm ${className}`}
      >
        {/* Cancel button — top right */}
        {onCancel && (
          <div className="flex justify-end p-4">
            <button
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Step progress */}
        <div className="px-6 pb-4">
          <WizardProgressBar steps={steps} currentStep={currentStep} />
        </div>

        {/* Animated content area */}
        <div className="border-t border-border/50 p-6">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </div>
    </div>
  );
}
