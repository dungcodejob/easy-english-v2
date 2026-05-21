import type { WordSenseDetail } from '@/modules/learning/services/dictionary.api';
import { ClarionProgress } from '@/shared/ui';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { Volume2 } from 'lucide-react';
import { useRef } from 'react';
import type { LearningStateData } from './types';

interface WordHeroProps {
  detail: WordSenseDetail;
  learningState: LearningStateData | null | undefined;
  isLoadingState: boolean;
}

export function WordHero({
  detail,
  learningState,
  isLoadingState,
}: WordHeroProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (url: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
    } else if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }
    audioRef.current
      .play()
      .catch((e) => console.error('Audio playback failed', e));
  };

  const defaultPronunciation =
    detail.pronunciations.find((p) => p.region === 'US') ||
    detail.pronunciations[0];

  const masteryPercent = learningState
    ? Math.round((learningState.masteryLevel / 5) * 100)
    : 0;

  return (
    <section className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="space-y-4">
        {detail.cefrLevel && (
          <div className="inline-flex items-center rounded-full bg-secondary-container px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-on-secondary-container">
            Level: {detail.cefrLevel}
          </div>
        )}

        <div className="flex items-center gap-6">
          <h1 className="font-headline text-6xl font-extrabold tracking-tighter text-primary dark:text-on-surface md:text-8xl capitalize">
            {detail.wordText}
          </h1>
          {defaultPronunciation?.audioUrl && (
            <button
              onClick={() => playAudio(defaultPronunciation.audioUrl!)}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-surface 
              shadow-md transition-all hover:bg-primary-fixed-dim 
              dark:bg-surface-container dark:hover:bg-surface-container-high
              dark:border dark:border-white/10
              border border-white/5
              active:scale-90"
              aria-label="Play pronunciation"
            >
              <Volume2 className="h-7 w-7" />
            </button>
          )}
        </div>

        {defaultPronunciation?.ipa ? (
          <p className="text-xl text-on-surface-variant font-medium">
            {defaultPronunciation.ipa} &bull;{' '}
            <span className="italic">{detail.partOfSpeech}</span>
          </p>
        ) : detail.partOfSpeech ? (
          <p className="text-xl text-on-surface-variant font-medium">
            {detail.partOfSpeech}
          </p>
        ) : null}
      </div>

      {isLoadingState && <Skeleton className="h-32 w-72 rounded-xl" />}

      {!isLoadingState && learningState && (
        <div className="flex min-w-[280px] flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-[0_12px_32px_rgba(26,27,30,0.06)]">
          <div className="flex items-center justify-between">
            <span className="font-headline font-semibold text-primary">
              Mastery Level
            </span>
            <span className="font-bold text-secondary">{masteryPercent}%</span>
          </div>
          <ClarionProgress
            value={masteryPercent}
            size="lg"
            indicatorClassName="[&>*]:!bg-tertiary-fixed-dim"
          />
          <p className="text-xs text-on-surface-variant">
            Reviewed {learningState.reviewCount}
            {learningState.reviewCount === 1 ? ' time' : ' times'}.{' '}
            {masteryPercent >= 80 ? "You're doing great!" : 'Keep practicing!'}
          </p>
        </div>
      )}
    </section>
  );
}
