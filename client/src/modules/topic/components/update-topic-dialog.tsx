/**
 * UpdateTopicDialog — Topic module
 *
 * Styled to match the "Scholarly Sanctuary" modal mockup.
 * Fields marked with [API TODO] are UI-ready but not yet supported by the backend.
 * Once the API adds these fields, uncomment the relevant state + submission logic.
 */

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
  Pencil,
  PenTool,
} from 'lucide-react';
import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import { useUpdateTopic } from '../hooks/use-topic-mutations';
import type { Topic } from '../services/topic.api';

// ── [API TODO] Icon picker options ──────────────────────────────────────────
// Backend does not support `icon` field yet. When it does, read topic.icon and
// send selectedIcon as part of the updateTopic payload.
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

// ── [API TODO] Theme color options ──────────────────────────────────────────
// Backend does not support `themeColor` field yet.
const COLOR_OPTIONS = [
  { id: 'deep-blue', hex: '#1B365D', label: 'Deep Blue' },
  { id: 'forest-green', hex: '#2E4D44', label: 'Forest Green' },
  { id: 'muted-amber', hex: '#A67C52', label: 'Muted Amber' },
  { id: 'deep-burgundy', hex: '#5D1B1B', label: 'Deep Burgundy' },
  { id: 'slate-gray', hex: '#4A5568', label: 'Slate Gray' },
  { id: 'sage', hex: '#7C8E7C', label: 'Sage' },
  { id: 'midnight', hex: '#0F172A', label: 'Midnight' },
] as const;

// ── [API TODO] Category options ─────────────────────────────────────────────
// Backend does not support `category` field yet.
const CATEGORY_OPTIONS = [
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'idioms', label: 'Idioms & Phrases' },
  { value: 'business', label: 'Business English' },
  { value: 'travel', label: 'Travel & Culture' },
] as const;

interface UpdateTopicDialogProps {
  topic: Topic;
  trigger?: React.ReactNode;
}

export function UpdateTopicDialog({ topic, trigger }: UpdateTopicDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(topic.name);
  const [description, setDescription] = useState(topic.description || '');

  // [API TODO] Uncomment + read from topic when backend supports these fields:
  const [selectedIcon, setSelectedIcon] = useState('graduation-cap');
  const [selectedColor, setSelectedColor] = useState('deep-blue');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { mutate: updateTopic, isPending } = useUpdateTopic();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateTopic(
      {
        id: topic.id,
        name: name.trim(),
        description: description.trim() || undefined,
        // [API TODO] Include these when backend supports them:
        // icon: selectedIcon,
        // themeColor: selectedColor,
        // category: selectedCategory || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="overflow-hidden p-0 sm:max-w-lg [&>button]:hidden">
        {/* Header */}
        <div className="px-10 pb-6 pt-10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold tracking-tight text-on-primary-fixed">
                Edit Topic
              </h2>
              <p className="text-sm text-on-surface-variant">
                Update your topic details and preferences.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 px-10 pb-10">
          {/* Topic Name — underline style */}
          <div className="space-y-2">
            <label
              htmlFor="update-topic-name"
              className="block px-1 text-sm font-semibold tracking-wide text-[var(--on-primary-fixed-variant)]"
            >
              Topic Name
            </label>
            <input
              id="update-topic-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Business Vocabulary"
              maxLength={100}
              autoFocus
              required
              className="w-full border-0 border-b-2 border-outline-variant/30 bg-transparent py-3 font-headline text-lg text-on-surface transition-colors placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
            />
          </div>

          {/* [API TODO] Icon Picker — UI ready, backend does not support `icon` field */}
          <div className="space-y-3">
            <label className="block px-1 text-sm font-semibold tracking-wide text-[var(--on-primary-fixed-variant)]">
              Choose Icon
            </label>
            <div className="grid grid-cols-5 gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-7">
              {ICON_OPTIONS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedIcon(id)}
                  title={label}
                  className={
                    selectedIcon === id
                      ? 'flex items-center justify-center rounded-lg bg-primary p-2 text-white shadow-sm'
                      : 'flex items-center justify-center rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-variant'
                  }
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* [API TODO] Theme Color Picker — UI ready, backend does not support `themeColor` field */}
          <div className="space-y-3">
            <label className="block px-1 text-sm font-semibold tracking-wide text-[var(--on-primary-fixed-variant)]">
              Choose Theme Color
            </label>
            <div className="flex flex-wrap gap-4 rounded-xl bg-surface-container-low p-4">
              {COLOR_OPTIONS.map(({ id, hex, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedColor(id)}
                  title={label}
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    selectedColor === id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* [API TODO] Category Dropdown — UI ready, backend does not support `category` field */}
          <div className="space-y-2">
            <label
              htmlFor="update-topic-category"
              className="block px-1 text-sm font-semibold tracking-wide text-[var(--on-primary-fixed-variant)]"
            >
              Category
            </label>
            <div className="relative">
              <select
                id="update-topic-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="update-topic-desc"
              className="block px-1 text-sm font-semibold tracking-wide text-[var(--on-primary-fixed-variant)]"
            >
              Brief Description
            </label>
            <textarea
              id="update-topic-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the focus of this topic..."
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-xl border-none bg-surface-container-low px-5 py-4 text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-6 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="font-headline text-sm font-semibold text-[var(--on-primary-fixed-variant)] transition-colors hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="rounded-full bg-gradient-to-br from-primary to-primary-container px-10 py-4 font-headline font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

        {/* Decorative gradient strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-tertiary-fixed-dim opacity-50" />
      </DialogContent>
    </Dialog>
  );
}
