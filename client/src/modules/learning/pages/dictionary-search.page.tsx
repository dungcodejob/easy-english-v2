import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { SearchInput } from '../components/search-input';
import { SearchResultsList } from '../components/search-results-list';
import { useSearchWordSenses } from '../hooks/use-search-word-senses';
import { useSearchStore } from '../stores/use-search-store';

export const Route = createFileRoute('/dictionary/')({
  component: DictionarySearchPage,
});

const PAGE_SIZE = 20;

export default function DictionarySearchPage() {
  const { debouncedQuery } = useSearchStore();
  const [skip, setSkip] = useState(0);

  const {
    data: result,
    isLoading,
    isFetching,
  } = useSearchWordSenses({
    query: debouncedQuery,
    top: PAGE_SIZE,
    skip,
  });

  const data = result?.data || [];
  const pagination = result?.pagination || {
    top: PAGE_SIZE,
    skip: 0,
    count: 0,
    hasMore: false,
  };

  // Reset pagination when query changes
  // We use effects purely for reset, UI stays snappy
  if (
    debouncedQuery &&
    skip > 0 &&
    !isFetching &&
    result?.pagination?.count === 0
  ) {
    // Edge case if somehow query changes and skips are mismatched
    setSkip(0);
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col items-center mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
          Dictionary
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl text-balance">
          Search our comprehensive database of English vocabulary, including
          definitions, examples, idioms, and translations.
        </p>
      </div>

      <div className="mb-12">
        <SearchInput />
      </div>

      <div className="min-h-[400px]">
        <SearchResultsList
          isLoading={isLoading && isFetching}
          isFetching={isFetching}
          results={data}
          pagination={{
            top: pagination.top,
            skip: pagination.skip ?? skip,
            count: pagination.count ?? 0,
            hasMore: pagination.hasMore,
          }}
          onPageChange={(newSkip) => setSkip(newSkip)}
        />
      </div>
    </div>
  );
}
