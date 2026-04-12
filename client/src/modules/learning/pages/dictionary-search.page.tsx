import { createFileRoute, Link } from '@tanstack/react-router';
import { BookmarkPlus, History, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { SearchInput } from '../components/search-input';
import { SearchResultsList } from '../components/search-results-list';
import { useSearchWordSenses } from '../hooks/use-search-word-senses';
import { useSearchStore } from '../stores/use-search-store';

export const Route = createFileRoute('/_(authenticated)/dictionary/')({
  component: DictionarySearchPage,
});

const PAGE_SIZE = 20;

const RECENT_SUGGESTIONS = [
  'Ephemeral',
  'Luminescent',
  'Serendipity',
  'Solitude',
];

export default function DictionarySearchPage() {
  const { debouncedQuery, setQuery, setDebouncedQuery } = useSearchStore();
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

  if (
    debouncedQuery &&
    skip > 0 &&
    !isFetching &&
    result?.pagination?.count === 0
  ) {
    setSkip(0);
  }

  const handleSuggestionClick = (word: string) => {
    setQuery(word);
    setDebouncedQuery(word);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12 pt-6 md:px-8 md:pt-10">
      {/* ── Hero + Search ────────────────────────────────────────── */}
      <div className="mb-12">
        <div className="mb-8">
          <h1 className="mb-4 font-headline text-4xl font-extrabold italic tracking-tight text-on-primary-fixed md:text-5xl">
            Easy English Dictionary
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">
            Expand your linguistic horizons in our quiet sanctuary of words.
            Search for any term to start your journey.
          </p>
        </div>

        <SearchInput />
      </div>

      {/* ── Recent Searches (show when no active search) ──────── */}
      {!debouncedQuery && (
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
                onClick={() => handleSuggestionClick(word)}
                className="flex items-center gap-2 rounded-full bg-surface-container-low px-5 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                <History className="h-4 w-4" />
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Search Results ────────────────────────────────────────── */}
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

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      {!debouncedQuery && (
        <div className="relative mt-12 overflow-hidden rounded-xl bg-primary p-10 text-white md:p-12">
          {/* Decorative blurs */}
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-surface-container-lowest/5 blur-3xl" />
          <div className="absolute right-20 top-10 h-48 w-48 rounded-full bg-primary-container opacity-50 blur-2xl" />

          <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
            <div className="flex-1">
              <h3 className="mb-4 font-headline text-3xl font-bold">
                Master 10 New Words Today
              </h3>
              <p className="mb-8 max-w-lg text-lg text-on-primary-container">
                Our adaptive algorithm suggests words based on your learning
                journey and recent searches.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/learning/topics"
                  className="flex items-center gap-2 rounded-full bg-tertiary-fixed px-8 py-3 font-bold text-[var(--on-tertiary-fixed)] shadow-lg transition-all hover:scale-105"
                >
                  <Sparkles className="h-4 w-4" />
                  Start Session
                </Link>
                <button className="rounded-full border border-white/20 px-8 py-3 font-semibold transition-colors hover:bg-white/10">
                  View List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
