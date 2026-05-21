import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/shared/ui/shadcn/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface TopicDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}

export function TopicDialogShell({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: TopicDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="overflow-hidden p-0 sm:max-w-lg [&>button]:hidden">
        {/* Header */}
        <div className="px-10 pb-6 pt-10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold tracking-tight text-on-primary-fixed">
                {title}
              </h2>
              <p className="text-sm text-on-surface-variant">{description}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {children}

        {/* Decorative gradient strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-tertiary-fixed-dim opacity-50" />
      </DialogContent>
    </Dialog>
  );
}
