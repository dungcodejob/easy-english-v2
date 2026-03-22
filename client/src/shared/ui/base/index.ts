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
