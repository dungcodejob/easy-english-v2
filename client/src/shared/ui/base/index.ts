/**
 * Base Components — barrel export
 *
 * DS-wrapped versions of shadcn components.
 * Feature modules MUST import from here, never directly from '@/shared/ui/shadcn'.
 *
 * The rule:
 *   import { DsButton } from '@/shared/ui'     ✅ CORRECT
 *   import { Button } from '@/shared/ui/shadcn'  ❌ VIOLATION
 *
 * If a DS wrapper doesn't exist yet, create it first, then use it.
 * If shadcn's API is sufficient and needs no extension, re-export with:
 *   export { Button } from '@/shared/ui/shadcn/button'
 */

export { DsButton } from './ds-button';
export type { DsButtonProps } from './ds-button';

export { DsInput } from './ds-input';
export type { DsInputProps } from './ds-input';

export { DsSelect, DsSelectItem } from './ds-select';
export type { DsSelectProps } from './ds-select';

export { DsTextarea } from './ds-textarea';
export type { DsTextareaProps } from './ds-textarea';

export { DsBadge } from './ds-badge';
export type { DsBadgeProps } from './ds-badge';

export { DsCard } from './ds-card';

export { DsStatCard } from './ds-stat-card';

export { DsEmptyState } from './ds-empty-state';

export { DsErrorState } from './ds-error-state';
export type { DsErrorStateProps } from './ds-error-state';

export { ClarionProgress } from './clarion-progress';
export type { ClarionProgressProps } from './clarion-progress';

export { DsSpinner } from './ds-spinner';
export type { DsSpinnerProps } from './ds-spinner';

export {
  DsAlertDialog,
  DsAlertDialogAction,
  DsAlertDialogCancel,
  DsAlertDialogContent,
  DsAlertDialogDescription,
  DsAlertDialogFooter,
  DsAlertDialogHeader,
  DsAlertDialogTitle,
  DsAlertDialogTrigger,
} from './ds-alert-dialog';
export type {
  DsAlertDialogActionProps,
  DsAlertDialogCancelProps,
  DsAlertDialogContentProps,
  DsAlertDialogDescriptionProps,
  DsAlertDialogFooterProps,
  DsAlertDialogHeaderProps,
  DsAlertDialogProps,
  DsAlertDialogTitleProps,
  DsAlertDialogTriggerProps,
} from './ds-alert-dialog';

export { ClarionInput } from './clarion-input';
export { ClarionLabel } from './clarion-label';
export { ClarionTextarea } from './clarion-textarea';
