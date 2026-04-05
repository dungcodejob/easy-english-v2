/**
 * TopicWordCard — Topic module
 *
 * UI: DsAlertDialog, DsBadge, DsButton, DsCard.
 */

import {
  DsAlertDialog,
  DsAlertDialogAction,
  DsAlertDialogCancel,
  DsAlertDialogContent,
  DsAlertDialogDescription,
  DsAlertDialogFooter,
  DsAlertDialogHeader,
  DsAlertDialogTitle,
  DsAlertDialogTrigger,
  DsBadge,
  DsButton,
  DsCard,
} from '@/shared/ui';
import { BookOpen, Trash2 } from 'lucide-react';
import { useRemoveTopicWord } from '../hooks/use-topic-mutations';
import type { TopicWord } from '../services/topic.api';

interface TopicWordCardProps {
  word: TopicWord;
  topicId: string;
}

const POS_COLORS: Record<string, string> = {
  noun: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  verb: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  adjective:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  adverb:
    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

export function TopicWordCard({ word, topicId }: TopicWordCardProps) {
  const { mutate: removeWord, isPending } = useRemoveTopicWord(topicId);
  const posKey = (word.partOfSpeech ?? '').toLowerCase();
  const posClass =
    POS_COLORS[posKey] ??
    'bg-secondary/40 text-secondary-foreground border-secondary/40';

  return (
    <DsCard className="group flex items-start justify-between gap-4 border border-border/60 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-sm">
      {/* Word info */}
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold lowercase text-foreground">
              {word.wordText ?? '—'}
            </span>
            {word.partOfSpeech && (
              <DsBadge
                variant="outline"
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${posClass}`}
              >
                {word.partOfSpeech}
              </DsBadge>
            )}
          </div>
          {word.definition && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {word.definition}
            </p>
          )}
        </div>
      </div>

      {/* Remove action */}
      <DsAlertDialog>
        <DsAlertDialogTrigger asChild>
          <DsButton
            variant="ghost"
            size="icon"
            className="group-hover:opacity-100 cursor-pointer opacity-0 shrink-0 rounded-lg text-muted-foreground transition-opacity duration-150 hover:bg-destructive/10 hover:text-destructive focus:opacity-100 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Remove word from topic"
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </DsButton>
        </DsAlertDialogTrigger>
        <DsAlertDialogContent>
          <DsAlertDialogHeader>
            <DsAlertDialogTitle>Remove word?</DsAlertDialogTitle>
            <DsAlertDialogDescription>
              This will remove{' '}
              <strong className="text-foreground">
                {word.wordText ?? 'this word'}
              </strong>{' '}
              from the topic. The word will still be in your learning list.
            </DsAlertDialogDescription>
          </DsAlertDialogHeader>
          <DsAlertDialogFooter>
            <DsAlertDialogCancel>Cancel</DsAlertDialogCancel>
            <DsAlertDialogAction
              isLoading={isPending}
              loadingLabel="Removing…"
              onClick={() => removeWord(word.id)}
            >
              Remove
            </DsAlertDialogAction>
          </DsAlertDialogFooter>
        </DsAlertDialogContent>
      </DsAlertDialog>
    </DsCard>
  );
}
