import { Separator } from '@/shared/ui/shadcn/separator';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { BookOpen, Quote, TrendingUp, Volume2 } from 'lucide-react';
import { useRef } from 'react';
import { useLearningState } from '../hooks/use-learning-state';
import type { WordSenseDetail as WordSenseDetailType } from '../services/dictionary.api';
import { AddToLearningButton } from './add-to-learning-button';

interface WordSenseDetailProps {
  detail: WordSenseDetailType;
}

export function WordSenseDetail({ detail }: WordSenseDetailProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: stateResponse, isLoading: isLoadingState } = useLearningState(
    detail.senseId,
  );
  const learningState = stateResponse?.data;

  // Play audio function
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

  // Find priority pronunciation (US first, else whatever)
  const defaultPronunciation =
    detail.pronunciations.find((p) => p.region === 'US') ||
    detail.pronunciations[0];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-12">
      {/* Header section */}
      <div className="relative">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-4">
          <div className="space-y-4">
            {/* POS badge + CEF level */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium uppercase">
                {detail.partOfSpeech}
              </span>
              {detail.cefrLevel && (
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium">
                  {detail.cefrLevel}
                </span>
              )}
            </div>

            {/* Word — huge headline */}
            <h1 className="font-headline text-6xl font-black text-primary mb-1">
              {detail.wordText}
            </h1>

            {/* Pronunciation */}
            {defaultPronunciation && (
              <div className="flex items-center gap-4">
                <span className="text-2xl text-on-surface-variant italic font-headline">
                  /{defaultPronunciation.ipa}/
                </span>
                {defaultPronunciation.audioUrl && (
                  <button
                    onClick={() => playAudio(defaultPronunciation.audioUrl!)}
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="lg:mt-4 shrink-0">
            <AddToLearningButton
              senseId={detail.senseId}
              isLearning={!!learningState?.isLearning}
            />
          </div>
        </div>
      </div>

      {/* Learning State Card */}
      {!isLoadingState && learningState && (
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface">
                  Learning Progress
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Reviewed {learningState.reviewCount}
                  {learningState.reviewCount === 1 ? ' time' : ' times'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              Level {learningState.masteryLevel}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-on-surface-variant">
              <span>Beginner</span>
              <span>Mastered</span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${(learningState.masteryLevel / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {isLoadingState && (
        <Skeleton className="h-32 w-full rounded-2xl opacity-50" />
      )}

      <Separator className="opacity-50" />

      {/* Definition section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <BookOpen className="h-5 w-5 text-secondary" />
          <h2 className="font-headline text-lg font-semibold">Definition</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 md:p-8 space-y-4">
          <p className="text-xl md:text-2xl leading-relaxed text-on-surface font-medium">
            {detail.definition}
          </p>
          {detail.definitionVi && (
            <div className="flex items-start gap-3 mt-4 pt-4 border-t border-outline-variant/30">
              <div className="px-2 py-1 bg-surface-container-high rounded text-xs font-bold text-on-surface-variant uppercase tracking-wider shrink-0 mt-1">
                VI
              </div>
              <p className="text-lg text-on-surface-variant">
                {detail.definitionVi}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Examples section */}
      {detail.examples.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Quote className="h-5 w-5 text-secondary" />
            <h2 className="font-headline text-lg font-semibold">Examples</h2>
          </div>
          <div className="space-y-3">
            {detail.examples.map((example) => (
              <div
                key={example.order}
                className="rounded-2xl border border-outline-variant/20 bg-surface-container p-5 shadow-sm"
              >
                <div className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim shrink-0" />
                  <p className="text-on-surface italic text-base leading-relaxed">
                    "{example.text}"
                  </p>
                </div>
                {example.translationVi && (
                  <p className="text-sm text-on-surface-variant pl-6 mt-1">
                    {example.translationVi}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Synonyms and Antonyms */}
      {(detail.synonyms.length > 0 || detail.antonyms.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {detail.synonyms.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-headline text-lg font-semibold text-on-surface">
                Synonyms
              </h3>
              <div className="flex flex-wrap gap-2">
                {detail.synonyms.map((syn) => (
                  <span
                    key={syn}
                    className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                  >
                    {syn}
                  </span>
                ))}
              </div>
            </section>
          )}

          {detail.antonyms.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-headline text-lg font-semibold text-on-surface">
                Antonyms
              </h3>
              <div className="flex flex-wrap gap-2">
                {detail.antonyms.map((ant) => (
                  <span
                    key={ant}
                    className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm"
                  >
                    {ant}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Phrases & Idioms */}
      {((detail.phrases && detail.phrases.length > 0) ||
        (detail.idioms && detail.idioms.length > 0)) && (
        <>
          <Separator className="opacity-50" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {detail.phrases && detail.phrases.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-headline text-lg font-semibold text-on-surface">
                  Common Phrases
                </h3>
                <ul className="space-y-2">
                  {detail.phrases.map((phrase) => (
                    <li key={phrase} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim shrink-0" />
                      <span className="text-on-surface leading-relaxed">
                        {phrase}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {detail.idioms && detail.idioms.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-headline text-lg font-semibold text-on-surface">
                  Idioms
                </h3>
                <ul className="space-y-2">
                  {detail.idioms.map((idiom) => (
                    <li key={idiom} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim shrink-0" />
                      <span className="text-on-surface leading-relaxed">
                        {idiom}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
