/**
 * CreateTopicDialog — Topic module
 *
 * Styled to match the "Scholarly Sanctuary" modal mockup.
 * Uses the shared TopicForm (React Hook Form + Zod) for validation.
 */

import { Plus } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/shared/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/shared/ui/shadcn/dialog';
import { TopicForm, type TopicFormValues } from '../topic.form';
import { useCreateTopic } from './use-create-topic';

interface CreateTopicDialogProps {
  trigger?: React.ReactNode;
}

export function CreateTopicDialog({ trigger }: CreateTopicDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createTopic, isPending } = useCreateTopic();

  const handleSubmit = (data: TopicFormValues) => {
    createTopic(
      {
        name: data.name,
        description: data.description || undefined,
        // [API TODO] Include these when backend supports them:
        // icon: data.icon,
        // themeColor: data.themeColor,
        // category: data.category || undefined,
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
          <Button className="gap-2 rounded-xl font-semibold">
            <Plus className="h-4 w-4" />
            New Topic
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="overflow-hidden p-0 sm:max-w-lg [&>button]:hidden">
        {/* Header */}
        <div className="px-10 pb-6 pt-10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold tracking-tight text-on-primary-fixed">
                Create New Topic
              </h2>
              <p className="text-sm text-on-surface-variant">
                Define a new area of study for your learning journey.
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
        <TopicForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isPending={isPending}
          submitLabel="Create Topic"
          pendingLabel="Creating…"
          idPrefix="create-topic"
        />

        {/* Decorative gradient strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-tertiary-fixed-dim opacity-50" />
      </DialogContent>
    </Dialog>
  );
}
