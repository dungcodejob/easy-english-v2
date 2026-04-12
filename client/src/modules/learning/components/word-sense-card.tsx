import { DictionaryRoutes } from '@/shared/constants';
import { Link } from '@tanstack/react-router';
import { cn } from '@/shared/utils';
import type { WordSenseSearchResult } from '../types/learning.types';

interface WordSenseCardProps {
  sense: WordSenseSearchResult;
}

export function WordSenseCard({ sense }: WordSenseCardProps) {
  return (
    <Link
      to={DictionaryRoutes.senseDetail(sense.senseId)}
      className="outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl block"
    >
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-primary group-hover:underline font-headline">
                {sense.wordText}
              </span>
              <span
                className={cn(
                  'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide',
                  sense.partOfSpeech === 'adjective' && 'bg-secondary/10 text-secondary',
                  sense.partOfSpeech === 'noun' && 'bg-primary/10 text-primary',
                  sense.partOfSpeech === 'verb' && 'bg-tertiary-fixed/20 text-[var(--on-tertiary-fixed-variant)]',
                  (!sense.partOfSpeech || (sense.partOfSpeech !== 'adjective' && sense.partOfSpeech !== 'noun' && sense.partOfSpeech !== 'verb')) && 'bg-surface-container-high text-on-surface-variant',
                )}
              >
                {sense.partOfSpeech}
              </span>
            </div>
            {sense.cefrLevel && (
              <span className="px-2 py-0.5 rounded-full border border-outline text-[10px] text-on-surface-variant shrink-0">
                {sense.cefrLevel}
              </span>
            )}
          </div>

          <p className="text-sm text-on-surface line-clamp-2 leading-relaxed">
            {sense.shortDefinition || 'No short definition available.'}
          </p>
        </div>
      </div>
    </Link>
  );
}
