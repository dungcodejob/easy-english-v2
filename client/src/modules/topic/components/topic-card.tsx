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
import type { Topic } from '../services/topic.api';

interface TopicCardProps {
  topic: Topic;
  onEdit?: (topic: Topic) => void;
  onDelete?: (topic: Topic) => void;
}

export function TopicCard({ topic, onEdit, onDelete }: TopicCardProps) {
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

          {(onEdit || onDelete) && (
            <div
              className="flex items-center gap-0.5"
              onClick={(e) => e.preventDefault()}
            >
              {onEdit && (
                <DsButton
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-on-surface-variant hover:text-on-surface"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(topic);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </DsButton>
              )}
              {(onDelete || onEdit) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DsButton
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-on-surface"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </DsButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          onEdit(topic);
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                    )}

                    {onDelete && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          onDelete(topic);
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 font-headline text-2xl font-bold text-primary">
          {topic.name}
        </h3>

        {/* Description */}
        <p className="mb-8 text-sm leading-relaxed text-on-surface-variant line-clamp-2">
          {topic.description || 'No description yet.'}
        </p>

        {/* Date footer — pushed to bottom */}
        <div className="mt-auto pt-4 border-t border-outline-variant/10">
          <span className="text-xs text-on-surface-variant">
            Created{' '}
            {new Date(topic.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
