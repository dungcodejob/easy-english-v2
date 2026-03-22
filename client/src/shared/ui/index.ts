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
export { spacing, spacingPx, color, chartColors, typography, radius } from './design-tokens';
export type { SpacingKey, RadiusKey } from './design-tokens';

/* ─── Base Components ───────────────────────────── */
export type { DsButtonProps } from './base/ds-button';
export { DsButton } from './base/ds-button';

export type { DsInputProps } from './base/ds-input';
export { DsInput } from './base/ds-input';

/* ─── Pattern Components ────────────────────────── */
export { FormWrapper } from './patterns/form-wrapper';
export { PageHeader, PageLayout } from './patterns/page-layout';
export { AnimatedStep, WizardLayout, WizardStepShell } from './patterns/wizard-layout';
export { ModalWrapper } from './patterns/modal-wrapper';

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
export {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from './shadcn/avatar';
export { Badge } from './shadcn/badge';
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './shadcn/card';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './shadcn/collapsible';
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
export {
  Empty,
} from './shadcn/empty';
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
export {
  Progress,
} from './shadcn/progress';
export {
  RadioGroup,
  RadioGroupItem,
} from './shadcn/radio-group';
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
export { Spinner } from './shadcn/spinner';
export {
  Switch,
} from './shadcn/switch';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './shadcn/table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './shadcn/tabs';
export { Textarea } from './shadcn/textarea';
export { Toaster } from './shadcn/sonner';
export { Toggle } from './shadcn/toggle';
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './shadcn/tooltip';
export { buttonVariants } from './shadcn/button';
