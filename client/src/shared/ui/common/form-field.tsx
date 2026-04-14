/**
 * FormField — Generic Form Field with react-hook-form Controller
 *
 * Wraps Controller + Field + FieldLabel + FieldError into a single
 * reusable component. Uses render-prop pattern so ANY control can be
 * placed inside (DsInput, Select, Textarea, Checkbox, etc.).
 *
 * Usage:
 *   import { FormField } from '@/shared/ui/common'
 *
 *   // Basic
 *   <FormField name="email" control={form.control} label="Email">
 *     {({ field, fieldState }) => (
 *       <DsInput {...field} placeholder="name@example.com" type="email" />
 *     )}
 *   </FormField>
 *
 *   // With description & extra content
 *   <FormField
 *     name="password"
 *     control={form.control}
 *     label="Password"
 *     description="Must be at least 8 characters"
 *     footer={<Link href="/forgot-password">Forgot password?</Link>}
 *   >
 *     {({ field }) => <DsInput {...field} type="password" />}
 *   </FormField>
 */

import type { ReactNode } from 'react';
import {
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Field, FieldDescription, FieldError } from '@/shared/ui/shadcn/field';
import { SurfaceLabel } from '../base/surface-label';

// ── Types ────────────────────────────────────────────────────────────

export interface FormFieldRenderArgs<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
}

/** Keys managed by FormField — excluded from div passthrough */
type OwnKeys =
  | 'name'
  | 'control'
  | 'label'
  | 'description'
  | 'footer'
  | 'disabled'
  | 'children';

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<React.ComponentProps<'div'>, OwnKeys> {
  /** Field name — must match a key in the form schema */
  name: TName;
  /** react-hook-form control object */
  control: Control<TFieldValues>;
  /** Label text displayed above the control */
  label: string;
  /** Optional description text displayed below the control */
  description?: string;
  /** Optional footer slot (e.g. "Forgot password?" link) rendered below error */
  footer?: ReactNode;
  /** Whether the field is disabled */
  disabled?: boolean;
  /**
   * Render-prop children — receives { field, fieldState } and must return
   * the form control element (DsInput, Select, Textarea, etc.)
   */
  children: (args: FormFieldRenderArgs<TFieldValues, TName>) => ReactNode;
}

// ── Component ────────────────────────────────────────────────────────

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  footer,
  disabled,
  children,
  ...divProps
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} {...divProps}>
          <SurfaceLabel htmlFor={field.name}>{label}</SurfaceLabel>

          {children({
            field: {
              ...field,
              disabled: disabled ?? field.disabled,
            } as ControllerRenderProps<TFieldValues, TName>,
            fieldState,
          })}

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

          {description && !fieldState.invalid && (
            <FieldDescription>{description}</FieldDescription>
          )}

          {footer}
        </Field>
      )}
    />
  );
}
