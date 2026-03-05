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
import { useSearchStore } from '../stores/use-search-store';
import type { WordSenseSearchResult } from '../types/learning.types';
import { WordSenseCard } from './word-sense-card';

interface SearchResultsListProps {
  isLoading: boolean;
  isFetching: boolean;
  results?: WordSenseSearchResult[];
  pagination?: {
    top: number;
    skip: number;
    count: number;
    hasMore: boolean;
  };
  onPageChange: (newSkip: number) => void;
}

export function SearchResultsList({
  isLoading,
  isFetching,
  results,
  pagination,
  onPageChange,
}: SearchResultsListProps) {
  const { debouncedQuery } = useSearchStore();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // No search entered yet
  if (!debouncedQuery) {
    return null;
  }

  // Search performed but no results
  if (!results?.length) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <SearchX className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>No words found</EmptyTitle>
        <EmptyDescription>
          We couldn't find any definitions matching "{debouncedQuery}". Try
          checking for typos or searching a different term.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((sense) => (
          <WordSenseCard key={sense.senseId} sense={sense} />
        ))}
      </div>

      {pagination && (pagination.skip > 0 || pagination.hasMore) && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onPageChange(Math.max(0, pagination.skip - pagination.top))
                }
                disabled={pagination.skip === 0 || isFetching}
              >
                <PaginationPrevious className="px-0 py-0 hover:bg-transparent" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <div className="text-sm text-muted-foreground px-4">
                {pagination.skip + 1} -{' '}
                {Math.min(pagination.skip + pagination.top, pagination.count)}{' '}
                of {pagination.count}
              </div>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(pagination.skip + pagination.top)}
                disabled={!pagination.hasMore || isFetching}
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
