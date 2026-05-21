/**
 * Pattern Components — barrel export
 *
 * Patterns are higher-order UI compositions that combine base components
 * with layout, behavior, and consistency guarantees.
 *
 * Rules:
 * - Each pattern must be self-contained (no external layout assumptions)
 * - Patterns receive content as children, never render business logic
 * - Import from this index, never from individual files in production
 */

export { FormWrapper } from './form-wrapper';
export { PageHeader, PageLayout } from './page-layout';
export {
  AnimatedStep,
  DEFAULT_WIZARD_STEPS,
  WizardLayout,
  WizardStepShell,
} from './wizard-layout';
export type { WizardStep } from './wizard-layout';
export { ModalWrapper } from './modal-wrapper';
