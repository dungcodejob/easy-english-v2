/**
 * Design System — top-level barrel export
 *
 * Feature modules MUST import from here, never from '@/shared/ui/shadcn'.
 *
 * The rule:
 *   import { DsButton } from '@/shared/ui'     ✅ CORRECT
 *   import { Button } from '@/shared/ui/shadcn'  ❌ VIOLATION
 *
 * If a DS wrapper doesn't exist yet, create it first, then use it.
 * Prefer pattern components for standard layouts.
 * Only import from shadcn directly when you need full Radix primitive control.
 */

/* ─── Design Tokens ─────────────────────────────── */
export {
  chartColors,
  color,
  radius,
  spacing,
  spacingPx,
  typography,
} from './design-tokens';
export type { RadiusKey, SpacingKey } from './design-tokens';

/* ─── Base Components ───────────────────────────── */
export { DsButton } from './base/ds-button';
export type { DsButtonProps } from './base/ds-button';

export { DsInput } from './base/ds-input';
export type { DsInputProps } from './base/ds-input';

export { DsSelect, DsSelectItem } from './base/ds-select';
export type { DsSelectProps } from './base/ds-select';

export { DsTextarea } from './base/ds-textarea';
export type { DsTextareaProps } from './base/ds-textarea';

export { DsBadge } from './base/ds-badge';
export type { DsBadgeProps } from './base/ds-badge';

export { DsCard } from './base/ds-card';

export { DsStatCard } from './base/ds-stat-card';

export { DsEmptyState } from './base/ds-empty-state';

export { DsPagination } from './base/ds-pagination';

export { ClarionProgress } from './base/clarion-progress';
export type { ClarionProgressProps } from './base/clarion-progress';

export { DsSpinner } from './base/ds-spinner';
export type { DsSpinnerProps } from './base/ds-spinner';

export { ClarionInput } from './base/clarion-input';
export { ClarionLabel } from './base/clarion-label';
export { ClarionTextarea } from './base/clarion-textarea';

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
} from './base/ds-alert-dialog';
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
} from './base/ds-alert-dialog';

/* ─── Common Components ─────────────────────────── */
export { FormField } from './common/form-field';
export type { FormFieldProps, FormFieldRenderArgs } from './common/form-field';

/* ─── Semantic Buttons (role-named) ─────────────── */
export { CTAButton } from './semantic/cta-button';
export { BackButton } from './semantic/back-button';
export { InlineEditButton } from './semantic/inline-edit-button';
export { SegmentedControlItem } from './semantic/segmented-control-item';

/* ─── Pattern Components ────────────────────────── */
export { FormWrapper } from './patterns/form-wrapper';
export { ModalWrapper } from './patterns/modal-wrapper';
export { PageHeader, PageLayout } from './patterns/page-layout';
export {
  AnimatedStep,
  WizardLayout,
  WizardStepShell,
} from './patterns/wizard-layout';

/* ─── Raw shadcn (use sparingly — prefer patterns) ─── */
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './shadcn/alert-dialog';
export { Avatar, AvatarFallback, AvatarImage } from './shadcn/avatar';
export { Badge } from './shadcn/badge';
export { buttonVariants } from './shadcn/button';
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './shadcn/card';
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './shadcn/collapsible';
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './shadcn/command';
export {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './shadcn/context-menu';
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './shadcn/dialog';
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './shadcn/dropdown-menu';
export { Empty } from './shadcn/empty';
export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './shadcn/field';
export { Input } from './shadcn/input';
export { Label } from './shadcn/label';
export {
  Pagination,
  PaginationContent,
  PaginationItem,
} from './shadcn/pagination';
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from './shadcn/popover';
export { Progress } from './shadcn/progress';
export { RadioGroup, RadioGroupItem } from './shadcn/radio-group';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './shadcn/select';
export { Separator } from './shadcn/separator';
export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './shadcn/sheet';
export { Skeleton } from './shadcn/skeleton';
export { Toaster } from './shadcn/sonner';
export { Spinner } from './shadcn/spinner';
export { Switch } from './shadcn/switch';
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './shadcn/table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './shadcn/tabs';
export { Textarea } from './shadcn/textarea';
export { Toggle } from './shadcn/toggle';
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './shadcn/tooltip';
