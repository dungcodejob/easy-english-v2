/**
 * DsAlertDialog — Design System Alert Dialog
 *
 * Wraps shadcn AlertDialog with extended DsAlertDialogAction (isLoading) and
 * DsAlertDialogCancel (isLoading) props.
 *
 * Usage:
 *   import { DsAlertDialog, DsAlertDialogAction, DsAlertDialogCancel } from '@/shared/ui'
 *   <DsAlertDialog open={open} onOpenChange={setOpen}>
 *     <DsAlertDialogTrigger asChild><DsButton>Delete</DsButton></DsAlertDialogTrigger>
 *     <DsAlertDialogContent>
 *       <DsAlertDialogHeader>
 *         <DsAlertDialogTitle>Remove word?</DsAlertDialogTitle>
 *         <DsAlertDialogDescription>...</DsAlertDialogDescription>
 *       </DsAlertDialogHeader>
 *       <DsAlertDialogFooter>
 *         <DsAlertDialogCancel>Cancel</DsAlertDialogCancel>
 *         <DsAlertDialogAction isLoading={isRemoving} onClick={handleRemove}>Remove</DsAlertDialogAction>
 *       </DsAlertDialogFooter>
 *     </DsAlertDialogContent>
 *   </DsAlertDialog>
 */

import {
  AlertDialog as ShadcnAlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/shadcn/alert-dialog';
import { Loader2Icon } from 'lucide-react';

export interface DsAlertDialogProps extends React.ComponentProps<typeof ShadcnAlertDialog> {}
export const DsAlertDialog = ShadcnAlertDialog;

export interface DsAlertDialogTriggerProps
  extends React.ComponentProps<typeof AlertDialogTrigger> {}
export const DsAlertDialogTrigger = AlertDialogTrigger;

export interface DsAlertDialogContentProps
  extends React.ComponentProps<typeof AlertDialogContent> {
  size?: 'default' | 'sm';
}
export const DsAlertDialogContent = AlertDialogContent;

export interface DsAlertDialogHeaderProps extends React.ComponentProps<'div'> {}
export const DsAlertDialogHeader = AlertDialogHeader;

export interface DsAlertDialogFooterProps extends React.ComponentProps<'div'> {}
export const DsAlertDialogFooter = AlertDialogFooter;

export interface DsAlertDialogTitleProps
  extends React.ComponentProps<typeof AlertDialogTitle> {}
export const DsAlertDialogTitle = AlertDialogTitle;

export interface DsAlertDialogDescriptionProps
  extends React.ComponentProps<typeof AlertDialogDescription> {}
export const DsAlertDialogDescription = AlertDialogDescription;

export interface DsAlertDialogActionProps extends React.ComponentProps<'button'> {
  isLoading?: boolean;
  loadingLabel?: string;
}

export function DsAlertDialogAction({
  isLoading,
  loadingLabel = 'Loading…',
  children,
  className,
  disabled,
  ...props
}: DsAlertDialogActionProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50 ${className ?? ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2Icon className="size-4 animate-spin" />}
      {isLoading ? loadingLabel : children}
    </button>
  );
}

export interface DsAlertDialogCancelProps extends React.ComponentProps<'button'> {
  isLoading?: boolean;
}

export function DsAlertDialogCancel({
  isLoading,
  children,
  className,
  disabled,
  ...props
}: DsAlertDialogCancelProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${className ?? ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading…' : children}
    </button>
  );
}
