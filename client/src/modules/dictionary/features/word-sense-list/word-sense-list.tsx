import { URLParamKeys } from '@/shared/constants';
import { Button } from '@/shared/ui/shadcn/button';
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/shadcn/empty';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/shadcn/pagination';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { SearchX } from 'lucide-react';
import { WordSenseCard } from '../../../learning/components/word-sense-card';
import { Route } from '../../screens/word-search.screen';
import { useSearchWordSenses } from './use-search-word-senses';

export function WordSenseList() {
  const { [URLParamKeys.query]: query = '' } = Route.useSearch();

  const {
    data,
    isLoading,
    isFetching,
    page,
    count,
    hasMore,
    setPage,
    hasPrev,
  } = useSearchWordSenses({ query });

  const results = data?.data ?? [];

  if (!query) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!results.length) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <SearchX className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>No words found</EmptyTitle>
        <EmptyDescription>
          We couldn't find any definitions matching "{query}". Try checking for
          typos or searching a different term.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((sense) => (
          <WordSenseCard
            key={sense.senseId}
            sense={sense}
            isLearned={sense.isLearned}
          />
        ))}
      </div>

      {(hasPrev || hasMore) && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!hasPrev || isFetching}
              >
                <PaginationPrevious className="px-0 py-0 hover:bg-transparent" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm text-muted-foreground px-4">
                Page {page}
                {count != null ? ` · ${count} results` : ''}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore || isFetching}
              >
                <PaginationNext className="px-0 py-0 hover:bg-transparent" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
