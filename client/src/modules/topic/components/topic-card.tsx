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

  return (
    <div className="group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
      {/* Main link covers the row */}
      <Link
        to={TopicRoutes.detail(topic.id)}
        className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        aria-label={`Open topic: ${topic.name}`}
      />

      {/* Name + description */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {topic.name}
        </p>
        {topic.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {topic.description}
          </p>
        )}
      </div>

      {/* Updated date */}
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatRelativeDate(topic.updatedAt)}
      </span>

      {/* Actions — visible on hover */}
      <div
        className="relative z-10 flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.preventDefault()}
      >
        <UpdateTopicDialog
          topic={topic}
          trigger={
            <DsButton
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
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

      {/* Chevron */}
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
    </div>
  );
}
