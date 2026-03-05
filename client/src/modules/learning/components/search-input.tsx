import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/shadcn/input-group';
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
    <div className="w-full max-w-2xl mx-auto">
      <InputGroup className="h-12 rounded-full shadow-sm hover:shadow-md transition-shadow bg-background/50 backdrop-blur-sm border-primary/20">
        <InputGroupAddon align="inline-start" className="pl-4">
          <InputGroupText>
            <Search className="h-5 w-5 text-muted-foreground" />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search words, idioms, or phrases..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="text-base h-12"
          autoFocus
        />
        <InputGroupAddon align="inline-end" className="pr-2">
          {localValue && (
            <InputGroupButton
              onClick={() => setLocalValue('')}
              size="icon-sm"
              variant="ghost"
              className="rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
      <p className="text-center text-xs text-muted-foreground mt-3">
        Try searching for{' '}
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={() => setLocalValue('phenomenon')}
        >
          phenomenon
        </span>
        ,{' '}
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={() => setLocalValue('look forward to')}
        >
          look forward to
        </span>
        , or{' '}
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={() => setLocalValue('out of the blue')}
        >
          out of the blue
        </span>
      </p>
    </div>
  );
}
