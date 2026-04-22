import { History } from 'lucide-react';
import { SearchInput } from '@/modules/dictionary/features/search-bar/search-bar';

const RECENT_SUGGESTIONS = [
  'Ephemeral',
  'Luminescent',
  'Serendipity',
  'Solitude',
];

interface DictionarySearchHeaderProps {
  keyword: string;
  urlKeyword: string;
  onKeywordChange: (value: string) => void;
  onClear: () => void;
}

export function DictionarySearchHeader({
  keyword,
  urlKeyword,
  onKeywordChange,
  onClear,
}: DictionarySearchHeaderProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-primary-fixed mb-4 tracking-tight">
          Easy English Dictionary
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
          Expand your linguistic horizons in our quiet sanctuary of words.
          Search for any term to start your journey.
        </p>
      </div>

      <div className="mb-4">
        <SearchInput
          value={keyword}
          onChange={onKeywordChange}
          onClear={onClear}
        />
      </div>

      {!urlKeyword && (
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-xl font-semibold text-on-surface">
              Recent Searches
            </h3>
            <button className="text-sm font-medium text-secondary hover:underline">
              Clear History
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {RECENT_SUGGESTIONS.map((word) => (
              <button
                key={word}
                onClick={() => onKeywordChange(word)}
                className="flex items-center gap-2 rounded-full bg-surface-container-low px-5 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                <History className="h-4 w-4" />
                {word}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
