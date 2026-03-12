import { APP_ROUTES } from '@/shared/constants';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { Card } from '@/shared/ui/shadcn/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { Link } from '@tanstack/react-router';
import { BookOpen, ChevronRight, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useDeleteTopic } from '../hooks/use-topic-mutations';
import type { Topic } from '../services/topic.api';
import { UpdateTopicDialog } from './update-topic-dialog';

interface TopicCardProps {
  topic: Topic;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TopicCard({ topic }: TopicCardProps) {
  const { mutate: deleteTopic } = useDeleteTopic();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTopic(topic.id);
  };

  return (
    <Link
      to={APP_ROUTES.TOPIC.DETAIL}
      params={{ topicId: topic.id }}
      className="group block focus:outline-none"
    >
      <Card className="relative h-full overflow-hidden border border-border/60 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 cursor-pointer focus-within:ring-2 focus-within:ring-primary/40">
        {/* Accent bar */}
        <div className="absolute left-0 top-0 h-full w-1 bg-primary/20 transition-colors duration-200 group-hover:bg-primary/60" />

        <div className="p-5 pl-6">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
                  {topic.name}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem asChild>
                    <UpdateTopicDialog
                      topic={topic}
                      trigger={
                        <span className="flex w-full items-center gap-2 cursor-pointer">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </span>
                      }
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
          </div>

          {/* Description */}
          {topic.description ? (
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {topic.description}
            </p>
          ) : (
            <p className="mb-4 text-sm text-muted-foreground/50 italic">
              No description
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(topic.updatedAt)}</span>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full text-xs font-medium bg-primary/5 text-primary border-transparent"
            >
              View topic
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
