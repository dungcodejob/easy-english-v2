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

  console.log(result);
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link to={DictionaryRoutes.search()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-12 animate-pulse mt-4">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-16 w-64 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-px w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-20 px-4 mt-8 border-2 border-dashed rounded-3xl bg-destructive/5 text-destructive border-destructive/20 shadow-sm">
          <h2 className="text-3xl font-black mb-3">Sense Not Found</h2>
          <p className="mb-8 text-lg opacity-80 max-w-md mx-auto">
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
