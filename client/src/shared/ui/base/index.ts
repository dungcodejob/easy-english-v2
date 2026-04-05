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

export type { DsButtonProps } from './ds-button';
export { DsButton } from './ds-button';

export type { DsInputProps } from './ds-input';
export { DsInput } from './ds-input';

export type { DsSelectProps } from './ds-select';
export { DsSelect, DsSelectItem } from './ds-select';

export type { DsTextareaProps } from './ds-textarea';
export { DsTextarea } from './ds-textarea';

export type { DsBadgeProps } from './ds-badge';
export { DsBadge } from './ds-badge';

export { DsCard } from './ds-card';

export { DsStatCard } from './ds-stat-card';

export { DsEmptyState } from './ds-empty-state';

export type { DsProgressProps } from './ds-progress';
export { DsProgress } from './ds-progress';

export type { DsSpinnerProps } from './ds-spinner';
export { DsSpinner } from './ds-spinner';

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
  DsAlertDialogProps,
  DsAlertDialogActionProps,
  DsAlertDialogCancelProps,
  DsAlertDialogContentProps,
  DsAlertDialogDescriptionProps,
  DsAlertDialogFooterProps,
  DsAlertDialogHeaderProps,
  DsAlertDialogTitleProps,
  DsAlertDialogTriggerProps,
} from './ds-alert-dialog';
