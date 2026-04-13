import { DictionaryRoutes } from '@/shared/constants';
import { Button } from '@/shared/ui/shadcn/button';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { WordSenseDetail } from '../components/word-sense-detail';
import { useWordSenseDetail } from '../hooks/use-word-sense-detail';

export const Route = createFileRoute(
  '/_(authenticated)/dictionary/senses/$senseId',
)({
  component: WordSenseDetailPage,
});

export default function WordSenseDetailPage() {
  const { senseId } = Route.useParams();

  const { data: result, isLoading, error } = useWordSenseDetail(senseId);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-12 pt-6 md:px-12">
      {/* Back button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
        >
          <Link to={DictionaryRoutes.search()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
      </div>

      {/* Loading skeleton — bento grid shape */}
      {isLoading && (
        <div className="space-y-12 animate-pulse">
          {/* Hero skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 flex-1">
              <Skeleton className="h-8 w-32 rounded-full" />
              <div className="flex items-center gap-6">
                <Skeleton className="h-20 w-80 rounded-xl" />
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-32 w-72 rounded-xl" />
          </div>

          {/* Bento grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Skeleton className="md:col-span-8 h-64 rounded-xl" />
            <div className="md:col-span-4 space-y-6">
              <Skeleton className="h-72 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
            <Skeleton className="md:col-span-6 h-40 rounded-xl" />
            <Skeleton className="md:col-span-6 h-40 rounded-xl" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="mt-8 rounded-xl border-2 border-dashed border-error/20 bg-error-container/10 px-4 py-20 text-center shadow-sm">
          <h2 className="mb-3 font-headline text-3xl font-black text-error">
            Sense Not Found
          </h2>
          <p className="mx-auto mb-8 max-w-md text-lg text-on-surface-variant">
            The word sense you are looking for does not exist or an error
            occurred while fetching it.
          </p>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full font-bold"
          >
            <Link to={DictionaryRoutes.search()}>Return to Dictionary</Link>
          </Button>
        </div>
      )}

      {result && <WordSenseDetail detail={result.data} />}
    </div>
  );
}
