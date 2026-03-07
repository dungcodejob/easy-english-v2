import { createFileRoute } from '@tanstack/react-router';
import { BookMarked } from 'lucide-react';
import { useState } from 'react';
import { LearningList } from '../components/learning-list';

export const Route = createFileRoute('/_(authenticated)/learning')({
  component: MyLearningPage,
});

export default function MyLearningPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-16">
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
            <BookMarked className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              My Learning
            </h1>
            <p className="mt-2 text-muted-foreground text-lg text-balance">
              Review and track the vocabulary you are actively learning.
            </p>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        <LearningList page={page} onPageChange={setPage} />
      </div>
    </div>
  );
}
