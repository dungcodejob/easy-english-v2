import { Button } from '@/shared/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateTopicMutation } from '../../hooks/topic.hooks';
import { useTopicStore } from '../../stores/topic.store';

export function CreateTopicDialog() {
  const { isCreateModalOpen, closeCreateModal } = useTopicStore();
  const createTopic = useCreateTopicMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isOpen = isCreateModalOpen === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createTopic.mutateAsync({ name, description });
      toast.success('Topic created successfully');
      setName('');
      setDescription('');
      closeCreateModal();
    } catch (error) {
      toast.error('Failed to create topic. Limit is 50 topics.');
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeCreateModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Topic</DialogTitle>
            <DialogDescription>
              Create a new topic to organize your vocabulary. You can create up
              to 50 topics.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Travel, Business"
                maxLength={100}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Topic description..."
                maxLength={500}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeCreateModal}
              disabled={createTopic.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTopic.isPending || !name.trim()}
            >
              {createTopic.isPending ? 'Creating...' : 'Create Topic'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
