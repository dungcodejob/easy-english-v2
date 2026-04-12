import { TopicRoutes } from '@/shared/constants';
import { DsButton } from '@/shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { Link } from '@tanstack/react-router';
import { ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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

  // Static progress for visual restyling — no real data in API yet
  const progressPercent = 0;

  return (
    <div className="group relative rounded-2xl border border-outline-variant/20 bg-surface-container p-6 transition-shadow hover:shadow-md">
      {/* Main link — covers the whole card */}
      <Link
        to={TopicRoutes.detail(topic.id)}
        className="absolute inset-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        aria-label={`Open topic: ${topic.name}`}
      />

      {/* Actions — top-right, visible on hover, above the card link */}
      <div
        className="relative z-10 mb-3 flex items-center justify-between"
        onClick={(e) => e.preventDefault()}
      >
        <span className="inline-block rounded-full bg-secondary/10 px-3 py-0.5 text-xs font-medium uppercase text-secondary">
          Active
        </span>

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

      {/* Topic name */}
      <h3 className="mb-2 font-headline text-lg font-semibold text-on-surface">
        {topic.name}
      </h3>

      {/* Description */}
      {topic.description && (
        <p className="mb-4 text-sm text-on-surface-variant">
          {topic.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-tertiary-fixed-dim"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-xs font-medium text-on-surface-variant">
          {progressPercent}%
        </span>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-on-surface-variant">
          {formatRelativeDate(topic.updatedAt)}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant/50 transition-colors group-hover:text-on-surface-variant" />
      </div>
    </div>
  );
}
