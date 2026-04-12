import { DictionaryRoutes } from '@/shared/constants';
import { cn } from '@/shared/utils';
import { Link } from '@tanstack/react-router';
import { BookmarkPlus, Volume2 } from 'lucide-react';
import { useMemo } from 'react';
import type { WordSenseSearchResult } from '../types/learning.types';

interface WordSenseCardProps {
  sense: WordSenseSearchResult;
}

export function WordSenseCard({ sense }: WordSenseCardProps) {
  const ipa = useMemo(() => {
    if (!sense.pronunciations || sense.pronunciations.length === 0) {
      return null;
    }

    const ipa = sense.pronunciations.find(
      (pronunciation) => pronunciation.region === 'us',
    )?.ipa;

    if (ipa) {
      return ipa;
    }

    return sense.pronunciations[0]?.ipa;
  }, [sense.pronunciations]);

  return (
    <div className="group flex h-full flex-col rounded-xl border border-outline-variant/5 bg-surface-container-lowest p-8 shadow-sm transition-all hover:shadow-lg">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span
            className={cn(
              'text-xs font-bold uppercase tracking-widest text-secondary mb-1 block',
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
            className="outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            <h4 className="text-3xl font-headline font-bold text-primary group-hover:text-on-primary-container transition-colors">
              {sense.wordText}
            </h4>
          </Link>
          {ipa && (
            <p className="text-on-secondary-container font-medium">{ipa}</p>
          )}
        </div>
        <button
          className="rounded-full p-2 text-secondary transition-colors hover:bg-secondary-container"
          aria-label="Pronounce word"
        >
          <Volume2 className="h-5 w-5" />
        </button>
      </div>

      <p className="mb-8 flex-grow leading-relaxed text-on-surface-variant">
        {sense.shortDefinition ||
          sense.definition ||
          'No definition available.'}
      </p>

      <Link
        to={DictionaryRoutes.senseDetail(sense.senseId)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-semibold text-white shadow-md transition-transform active:scale-95"
      >
        <BookmarkPlus className="h-5 w-5" />
        Add to Learning
      </Link>
    </div>
  );
}
