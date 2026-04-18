import { DictionaryRoutes } from '@/shared/constants';
import { cn } from '@/shared/utils';
import { Link } from '@tanstack/react-router';
import { BookmarkPlus, CheckCircle, Volume2 } from 'lucide-react';
import { useMemo } from 'react';
import type { WordSenseSearchResult } from '../types/learning.types';

interface WordSenseCardProps {
  sense: WordSenseSearchResult;
  isLearned?: boolean;
}

export function WordSenseCard({
  sense,
  isLearned = false,
}: WordSenseCardProps) {
  const ipa = useMemo(() => {
    if (!sense.pronunciations || sense.pronunciations.length === 0) {
      return null;
    }

    const usIpa = sense.pronunciations.find(
      (pronunciation) => pronunciation.region === 'us',
    )?.ipa;

    if (usIpa) {
      return usIpa;
    }

    return sense.pronunciations[0]?.ipa;
  }, [sense.pronunciations]);

  return (
    <div
      className={cn(
        'group flex h-full flex-col rounded-xl p-8 shadow-sm transition-all',
        isLearned
          ? 'border border-secondary/10 bg-secondary-container/30'
          : 'border border-outline-variant/5 bg-surface-container-lowest hover:shadow-lg',
      )}
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span
            className={cn(
              'mb-1 block text-xs font-bold uppercase tracking-widest',
              sense.partOfSpeech === 'adjective' && 'text-secondary',
              sense.partOfSpeech === 'noun' && 'text-secondary',
              sense.partOfSpeech === 'verb' && 'text-secondary',
              !['adjective', 'noun', 'verb'].includes(sense.partOfSpeech) &&
                'text-on-surface-variant',
            )}
          >
            {sense.partOfSpeech}
          </span>
          <Link
            to={DictionaryRoutes.senseDetail(sense.senseId)}
            className="rounded outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <h4
              className={cn(
                'font-headline text-3xl font-bold transition-colors capitalize',
                isLearned
                  ? 'text-[var(--on-secondary-fixed-variant)]'
                  : 'text-primary group-hover:text-on-primary-container',
              )}
            >
              {sense.wordText}
            </h4>
          </Link>
          {ipa && (
            <p
              className={cn(
                'font-medium',
                isLearned ? 'text-on-secondary-container' : 'text-outline',
              )}
            >
              {ipa}
            </p>
          )}
        </div>
        <button
          className={cn(
            'rounded-full p-2 transition-colors',
            isLearned
              ? 'bg-white/50 text-secondary hover:bg-white'
              : 'text-secondary hover:bg-secondary-container',
          )}
          aria-label="Pronounce word"
        >
          <Volume2 className="h-5 w-5" />
        </button>
      </div>

      <p
        className={cn(
          'mb-8 flex-grow leading-relaxed',
          isLearned
            ? 'text-[var(--on-secondary-fixed-variant)]'
            : 'text-on-surface-variant',
        )}
      >
        {sense.shortDefinition ||
          sense.definition ||
          'No definition available.'}
      </p>

      {isLearned ? (
        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 py-4 font-semibold text-white shadow-md transition-transform active:scale-95">
          <CheckCircle className="h-4 w-4" />
          Learned
        </button>
      ) : (
        <Link
          to={DictionaryRoutes.senseDetail(sense.senseId)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-semibold text-white shadow-md transition-transform active:scale-95"
        >
          <BookmarkPlus className="h-5 w-5" />
          Add to Learning
        </Link>
      )}
    </div>
  );
}
