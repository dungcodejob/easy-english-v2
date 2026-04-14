/**
 * TopicForm — Reusable form for create / update topic dialogs.
 *
 * Uses React Hook Form + Zod for validation.
 * Fields marked with [API TODO] are UI-ready but not yet supported by the backend.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import {
  BookOpen,
  Briefcase,
  Calculator,
  FlaskConical,
  Globe,
  GraduationCap,
  Languages,
  Loader2,
  MapPin,
  Palette,
  PenTool,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import { SurfaceInput } from '@/shared/ui/base/surface-input';
import { SurfaceTextarea } from '@/shared/ui/base/surface-textarea';
import { FormField } from '@/shared/ui/common/form-field';
import {
  topicFormSchema,
  type TopicFormValues,
} from '../models/topic-form.schema';
export type { TopicFormValues } from '../models/topic-form.schema';

// ── Constants ───────────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  { id: 'graduation-cap', icon: GraduationCap, label: 'School' },
  { id: 'book-open', icon: BookOpen, label: 'Book' },
  { id: 'pen-tool', icon: PenTool, label: 'Writing' },
  { id: 'languages', icon: Languages, label: 'Language' },
  { id: 'flask', icon: FlaskConical, label: 'Science' },
  { id: 'globe', icon: Globe, label: 'Global' },
  { id: 'calculator', icon: Calculator, label: 'Math' },
  { id: 'palette', icon: Palette, label: 'Art' },
  { id: 'briefcase', icon: Briefcase, label: 'Work' },
  { id: 'map-pin', icon: MapPin, label: 'Travel' },
] as const;

const COLOR_OPTIONS = [
  { id: 'deep-blue', hex: '#1B365D', label: 'Deep Blue' },
  { id: 'forest-green', hex: '#2E4D44', label: 'Forest Green' },
  { id: 'muted-amber', hex: '#A67C52', label: 'Muted Amber' },
  { id: 'deep-burgundy', hex: '#5D1B1B', label: 'Deep Burgundy' },
  { id: 'slate-gray', hex: '#4A5568', label: 'Slate Gray' },
  { id: 'sage', hex: '#7C8E7C', label: 'Sage' },
  { id: 'midnight', hex: '#0F172A', label: 'Midnight' },
] as const;

const CATEGORY_OPTIONS = [
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'idioms', label: 'Idioms & Phrases' },
  { value: 'business', label: 'Business English' },
  { value: 'travel', label: 'Travel & Culture' },
] as const;

// ── Component ───────────────────────────────────────────────────────────────
export interface TopicFormProps {
  /** Default values to populate the form (used for editing). */
  defaultValues?: Partial<TopicFormValues>;
  /** Called with validated form data on submit. */
  onSubmit: (data: TopicFormValues) => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
  /** Whether the mutation is in-flight. */
  isPending?: boolean;
  /** Label for the submit button. */
  submitLabel?: string;
  /** Label shown while the mutation is in-flight. */
  pendingLabel?: string;
}

const topicFormDefaultValues: TopicFormValues = {
  name: '',
  description: '',
  icon: 'graduation-cap',
  themeColor: 'deep-blue',
  category: '',
};

export function TopicForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending = false,
  submitLabel = 'Create Topic',
  pendingLabel = 'Creating…',
}: TopicFormProps) {
  const { control, handleSubmit } = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      ...topicFormDefaultValues,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-10 pb-10">
      {/* Topic Name */}
      <FormField name="name" control={control} label="Topic Name">
        {({ field, fieldState }) => (
          <SurfaceInput
            {...field}
            placeholder="e.g. Business Vocabulary"
            maxLength={100}
            autoFocus
            aria-invalid={fieldState.invalid}
          />
        )}
      </FormField>

      {/* [API TODO] Icon Picker */}
      <FormField name="icon" control={control} label="Choose Icon">
        {({ field }) => (
          <div className="grid grid-cols-5 gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-7">
            {ICON_OPTIONS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => field.onChange(id)}
                title={label}
                className={
                  field.value === id
                    ? 'flex items-center justify-center rounded-lg bg-primary p-2 text-white shadow-sm'
                    : 'flex items-center justify-center rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-variant'
                }
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        )}
      </FormField>

      {/* [API TODO] Theme Color Picker */}
      <FormField name="themeColor" control={control} label="Choose Theme Color">
        {({ field }) => (
          <div className="flex flex-wrap gap-4 rounded-xl bg-surface-container-low p-4">
            {COLOR_OPTIONS.map(({ id, hex, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => field.onChange(id)}
                title={label}
                className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                  field.value === id
                    ? 'ring-2 ring-primary ring-offset-2'
                    : ''
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        )}
      </FormField>

      {/* [API TODO] Category Dropdown */}
      <FormField name="category" control={control} label="Category">
        {({ field }) => (
          <div className="relative">
            <select
              {...field}
              className="w-full appearance-none rounded-xl border-none bg-surface-container-low px-5 py-4 text-on-surface transition-all focus:ring-2 focus:ring-primary-container"
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </FormField>

      {/* Description */}
      <FormField name="description" control={control} label="Brief Description">
        {({ field, fieldState }) => (
          <SurfaceTextarea
            {...field}
            placeholder="Describe the focus of this topic..."
            maxLength={500}
            rows={3}
            aria-invalid={fieldState.invalid}
          />
        )}
      </FormField>

      {/* Actions */}
      <div className="flex items-center justify-end gap-6 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="font-headline text-sm font-semibold text-[var(--on-primary-fixed-variant)] transition-colors hover:text-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-gradient-to-br from-primary to-primary-container px-10 py-4 font-headline font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:opacity-50"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {pendingLabel}
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
