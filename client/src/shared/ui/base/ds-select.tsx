/**
 * DsSelect — Design System Select
 *
 * Wraps the shadcn Select with a stable API contract.
 * Provides: consistent trigger styling, loading state, placeholder slot.
 *
 * Usage:
 *   import { DsSelect } from '@/shared/ui/base'
 *   <DsSelect value={value} onValueChange={setValue} placeholder="Select...">
 *     <DsSelectItem value="a">Option A</DsSelectItem>
 *     <DsSelectItem value="b">Option B</DsSelectItem>
 *   </DsSelect>
 */

import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/shared/utils';

export interface DsSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: ReactNode;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const DsSelect = forwardRef<HTMLButtonElement, DsSelectProps>(
  (
    {
      value,
      onValueChange,
      defaultValue,
      placeholder,
      children,
      className,
      disabled,
    },
    ref,
  ) => {
    return (
      <ShadcnSelect
        value={value}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          className={cn('w-full', className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </ShadcnSelect>
    );
  },
);

DsSelect.displayName = 'DsSelect';

export { SelectItem as DsSelectItem };
