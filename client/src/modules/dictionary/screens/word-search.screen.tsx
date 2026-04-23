import { URLParamKeys } from '@/shared/constants';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { z } from 'zod';
import { SearchBar } from '../features/search-bar/search-bar';
import { WordSenseList } from '../features/word-sense-list/word-sense-list';

const searchSchema = z.object({
  [URLParamKeys.query]: z.string().optional().default(''),
  [URLParamKeys.pageIndex]: z.string().optional(),
  [URLParamKeys.pageSize]: z.string().optional(),
});

export const Route = createFileRoute('/_(authenticated)/dictionary/')({
  validateSearch: searchSchema,
  component: WordSearchPage,
});

export default function WordSearchPage() {
  const { [URLParamKeys.query]: urlKeyword = '' } = Route.useSearch();

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12 pt-6 md:px-8 md:pt-10">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-primary-fixed mb-4 tracking-tight">
          Easy English Dictionary
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
          Expand your linguistic horizons in our quiet sanctuary of words.
          Search for any term to start your journey.
        </p>
      </div>

      {/* Search input */}
      <SearchBar />

      {/* Results — self-contained, reads query + pagination from URL */}
      <div className="min-h-[400px]">
        <WordSenseList />
      </div>

      {/* CTA Banner */}
      {!urlKeyword && (
        <div className="relative mt-12 overflow-hidden rounded-xl bg-primary p-10 text-white md:p-12">
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

            <img
              className="w-full md:w-80 h-48 object-cover rounded-xl shadow-2xl relative z-10"
              data-alt="Macro photography of an open dictionary with soft lighting highlighting the texture of paper and elegant typography"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuFgz3LX_ImXfovELyj-l811-FpuuG3gsOjlt1fiIGfeWtMpPJGxGbjz8HhYWJxFQGIT_1_gkLmHs_Jq1hupC9ByOhUlcDevlPegcjxWOPxRqubA_IplSufAtPVqBgVdTz9-flSYo1ls0DeytRmkvpjblnB2NpxEqBreP9KrFZNSePemTQi41NvRoQ6-jxLsQp-eCbnF8C8NSNNrn5wGghEjWAojwsqBPlb7YsyQ2rcxL5EVNk5fDRUhuVK_taji7QSOva41Yfb8M"
            />
          </div>
        </div>
      )}
    </section>
  );
}
