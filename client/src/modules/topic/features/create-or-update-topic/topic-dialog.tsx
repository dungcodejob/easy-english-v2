import {
  useImperativeDialog,
  type DialogHandle,
} from '@/shared/hooks/use-imperative-dialog';
import { Plus } from 'lucide-react';
import React from 'react';

import { Button } from '@/shared/ui/shadcn/button';

import type { Topic } from '../../services/topic.api';
import { TopicDialogShell } from './topic-dialog-shell';
import { TopicForm, type TopicFormValues } from './topic.form';
import { useCreateTopic } from './use-create-topic';
import { useUpdateTopic } from './use-update-topic';

export type TopicDialogHandle = DialogHandle<Topic>;

interface TopicDialogProps {
  ref?: React.Ref<TopicDialogHandle>;
  /** Uncontrolled trigger — opens the dialog in create mode on click. */
  trigger?: React.ReactNode;
}

export function TopicDialog({ ref, trigger }: TopicDialogProps) {
  const { data: topic, close, dialogProps } = useImperativeDialog<Topic>(ref);

  const isEdit = !!topic;

  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();

  const isPending = isEdit
    ? updateMutation.isPending
    : createMutation.isPending;

  const handleSubmit = (data: TopicFormValues) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
    };

    if (isEdit) {
      updateMutation.mutate({ id: topic.id, ...payload }, { onSuccess: close });
    } else {
      createMutation.mutate(payload, { onSuccess: close });
    }
  };

  const defaultTrigger = (
    <Button className="gap-2 rounded-xl font-semibold">
      <Plus className="h-4 w-4" />
      New Topic
    </Button>
  );

  return (
    <TopicDialogShell
      {...dialogProps}
      trigger={trigger ?? (!ref ? defaultTrigger : undefined)}
      title={isEdit ? 'Edit Topic' : 'Create New Topic'}
      description={
        isEdit
          ? 'Update your topic details and preferences.'
          : 'Define a new area of study for your learning journey.'
      }
    >
      <TopicForm
        key={topic?.id ?? 'create'}
        defaultValues={
          isEdit
            ? { name: topic.name, description: topic.description ?? '' }
            : undefined
        }
        onSubmit={handleSubmit}
        onCancel={close}
        isPending={isPending}
        submitLabel={isEdit ? 'Save Changes' : 'Create Topic'}
        pendingLabel={isEdit ? 'Saving…' : 'Creating…'}
      />
    </TopicDialogShell>
  );
}
