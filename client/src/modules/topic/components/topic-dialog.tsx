import { Pencil, Plus } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/shared/ui/shadcn/button';
import {
  useCreateTopic,
  useUpdateTopic,
} from '../hooks/use-topic-mutations';
import type { Topic } from '../services/topic.api';
import { TopicDialogShell } from './topic-dialog-shell';
import { TopicForm, type TopicFormValues } from './topic.form';

interface TopicDialogProps {
  /** Pass an existing topic to enter edit mode. Omit for create mode. */
  topic?: Topic;
  trigger?: React.ReactNode;
}

export function TopicDialog({ topic, trigger }: TopicDialogProps) {
  const isEdit = !!topic;
  const [open, setOpen] = useState(false);

  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();

  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  const handleSubmit = (data: TopicFormValues) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
    };

    const onSuccess = () => setOpen(false);

    if (isEdit) {
      updateMutation.mutate(
        { id: topic.id, ...payload },
        { onSuccess },
      );
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const defaultTrigger = isEdit ? (
    <Button variant="ghost" size="sm" className="gap-2">
      <Pencil className="h-4 w-4" />
      Edit
    </Button>
  ) : (
    <Button className="gap-2 rounded-xl font-semibold">
      <Plus className="h-4 w-4" />
      New Topic
    </Button>
  );

  return (
    <TopicDialogShell
      open={open}
      onOpenChange={setOpen}
      trigger={trigger ?? defaultTrigger}
      title={isEdit ? 'Edit Topic' : 'Create New Topic'}
      description={
        isEdit
          ? 'Update your topic details and preferences.'
          : 'Define a new area of study for your learning journey.'
      }
    >
      <TopicForm
        defaultValues={
          isEdit
            ? { name: topic.name, description: topic.description ?? '' }
            : undefined
        }
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
        isPending={isPending}
        submitLabel={isEdit ? 'Save Changes' : 'Create Topic'}
        pendingLabel={isEdit ? 'Saving…' : 'Creating…'}
      />
    </TopicDialogShell>
  );
}
