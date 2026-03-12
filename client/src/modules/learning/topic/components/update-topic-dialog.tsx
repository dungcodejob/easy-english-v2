import { Button } from '@/shared/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/shadcn/dialog';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useUpdateTopic } from '../hooks/use-topic-mutations';
import type { Topic } from '../services/topic.api';

interface UpdateTopicDialogProps {
  topic: Topic;
  trigger?: React.ReactNode;
}

export function UpdateTopicDialog({ topic, trigger }: UpdateTopicDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(topic.name);
  const [description, setDescription] = useState(topic.description || '');
  const { mutate: updateTopic, isPending } = useUpdateTopic();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateTopic(
      {
        id: topic.id,
        name: name.trim(),
        description: description.trim() || undefined,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Edit Topic
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update your topic name or description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="topic-name" className="text-sm font-semibold">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topic-name"
              placeholder="e.g. Business Vocabulary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
              required
              className="rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topic-desc" className="text-sm font-semibold">
              Description{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="topic-desc"
              placeholder="What will this topic cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="resize-none rounded-lg"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="gap-2 rounded-lg font-semibold"
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
