import { URLParamKeys } from '@/shared/constants';
import { useUrlSearch } from '@/shared/hooks';
import { History, Search, X } from 'lucide-react';
import { DictionaryRoute } from '../../screens/dictionary-search.screen';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search for a word...',
  autoFocus = true,
}: SearchInputProps) {
  return (
    <div className="relative group">
      <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
        <Search className="h-7 w-7 text-outline" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-xl border-none bg-surface-container-lowest py-7 pl-18 pr-16 font-headline text-2xl font-light shadow-xl transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/10 focus:outline-none"
      />
      <div className="absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {value ? (
          <button
            onClick={onClear}
            className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <kbd className="hidden items-center rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant sm:inline-flex">
            Ctrl K
          </kbd>
        )}
      </div>
    </div>
  );
}

const RECENT_SUGGESTIONS = [
  'Ephemeral',
  'Luminescent',
  'Serendipity',
  'Solitude',
];

export const SearchBar: React.FC = () => {
  const { keyword, updateKeyword, urlKeyword, clear } = useUrlSearch(
    DictionaryRoute.id,
    {
      paramKey: URLParamKeys.query,
      delay: 300,
    },
  );
  return (
    <>
      <div className="mb-4">
        <SearchInput value={keyword} onChange={updateKeyword} onClear={clear} />
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
                onClick={() => updateKeyword(word)}
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
};
