import { TopicRoutes } from '@/shared/constants';
import { DsButton } from '@/shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { Link } from '@tanstack/react-router';
import { BookOpen, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useDeleteTopic } from '../hooks/use-topic-mutations';
import type { Topic } from '../services/topic.api';
import { UpdateTopicDialog } from './update-topic-dialog';

interface TopicCardProps {
  topic: Topic;
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TopicCard({ topic }: TopicCardProps) {
  const { mutate: deleteTopic } = useDeleteTopic();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTopic(topic.id);
  };

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      {/* Decorative corner blob */}
      <div className="absolute -mr-10 -mt-10 right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/5 transition-all duration-700 group-hover:scale-150" />

      {/* Card link — covers the whole card */}
      <Link
        to={TopicRoutes.detail(topic.id)}
        className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        aria-label={`Open topic: ${topic.name}`}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Icon + Actions row */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-fixed transition-transform group-hover:rotate-6">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>

          <div
            className="flex items-center gap-0.5"
            onClick={(e) => e.preventDefault()}
          >
            <UpdateTopicDialog
              topic={topic}
              trigger={
                <DsButton
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-on-surface-variant hover:text-on-surface"
                  onClick={(e) => e.preventDefault()}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </DsButton>
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DsButton
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-on-surface-variant hover:text-on-surface"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </DsButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 font-headline text-2xl font-bold text-primary">
          {topic.name}
        </h3>

        {/* Description */}
        <p className="mb-8 text-sm leading-relaxed text-on-surface-variant line-clamp-2">
          {topic.description || 'No description yet.'}
        </p>

        {/* Progress footer — pushed to bottom */}

        <div className="mt-auto">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">
              2,100 Words
            </span>
            <span className="text-lg font-headline font-bold text-primary">
              41%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-secondary transition-colors group-hover:bg-primary"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
