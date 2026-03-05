import { APP_ROUTES } from '@/shared/constants';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Card } from '@/shared/ui/shadcn/card';
import { Link } from '@tanstack/react-router';
import type { WordSenseSearchResult } from '../types/learning.types';

interface WordSenseCardProps {
  sense: WordSenseSearchResult;
}

export function WordSenseCard({ sense }: WordSenseCardProps) {
  return (
    <Link
      to={APP_ROUTES.DICTIONARY.SENSE_DETAIL}
      params={{ senseId: sense.senseId }}
      className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl block"
    >
      <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer p-4 group">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-primary group-hover:underline">
                {sense.wordText}
              </span>
              <Badge
                variant="secondary"
                className="font-mono text-[10px] lowercase"
              >
                {sense.partOfSpeech}
              </Badge>
            </div>
            {sense.cefrLevel && (
              <Badge variant="outline" className="text-[10px] shrink-0">
                {sense.cefrLevel}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {sense.shortDefinition || 'No short definition available.'}
          </p>
        </div>
      </Card>
    </Link>
  );
}
