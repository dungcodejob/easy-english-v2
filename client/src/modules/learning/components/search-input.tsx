import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchStore } from '../stores/use-search-store';

export function SearchInput() {
  const { query, setQuery, setDebouncedQuery } = useSearchStore();
  const [localValue, setLocalValue] = useState(query);

  // Sync local value with global query (in case it changes from outside)
  useEffect(() => {
    setLocalValue(query);
  }, [query]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery(localValue);
      setDebouncedQuery(localValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, setQuery, setDebouncedQuery]);

  return (
    <div className="relative group">
      <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
        <Search className="h-7 w-7 text-outline" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Search for a word..."
        autoFocus
        className="w-full rounded-xl border-none bg-surface-container-lowest py-7 pl-18 pr-16 font-headline text-2xl font-light shadow-xl transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/10 focus:outline-none"
      />
      <div className="absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {localValue ? (
          <button
            onClick={() => setLocalValue('')}
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
