import { APP_ROUTES } from '@/shared/constants';
import { Button } from '@/shared/ui/shadcn/button';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { WordSenseDetail } from '../components/word-sense-detail';
import { useWordSenseDetail } from '../hooks/use-word-sense-detail';

export const Route = createFileRoute('/dictionary/senses/$senseId')({
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
          <Link to={APP_ROUTES.DICTIONARY.SEARCH}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-8 animate-pulse">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-8 w-16 mt-2" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-[2px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-16 px-4 border rounded-xl bg-destructive/5 text-destructive border-destructive/20">
          <h2 className="text-2xl font-bold mb-2">Sense Not Found</h2>
          <p className="mb-6">
            The word sense you are looking for does not exist or an error
            occurred.
          </p>
          <Button asChild variant="outline">
            <Link to={APP_ROUTES.DICTIONARY.SEARCH}>Return to Dictionary</Link>
          </Button>
        </div>
      )}

      {result && <WordSenseDetail detail={result.data} />}
    </div>
  );
}
