import { DsErrorState } from '@/shared/ui';
import { Button } from '@/shared/ui/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/shadcn/sheet';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { useWordSenseDetail } from '../../../dictionary/features/word-sense-detail/use-word-sense-detail';
import { WordSenseDetail } from './word-sense-detail';

interface WordSenseSheetProps {
  senseId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function WordSenseSheet({ senseId, onOpenChange }: WordSenseSheetProps) {
  const { data: result, isLoading, error } = useWordSenseDetail(senseId || '');

  return (
    <Sheet open={!!senseId} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Word Details</SheetTitle>
          <SheetDescription>
            View details for the selected word
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 md:p-8">
          {isLoading && (
            <div className="space-y-8 animate-pulse mt-4">
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
            <DsErrorState
              title="Sense Not Found"
              message="The word sense you are looking for does not exist or an error occurred."
              action={
                <Button onClick={() => onOpenChange(false)} variant="outline">
                  Close
                </Button>
              }
              className="mt-4"
            />
          )}

          {result && !isLoading && (
            <div className="mt-2">
              <WordSenseDetail detail={result.data} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
