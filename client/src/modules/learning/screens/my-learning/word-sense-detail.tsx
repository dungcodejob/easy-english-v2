import { ClarionProgress } from '@/shared/ui';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { CheckCircle, GraduationCap, Volume2 } from 'lucide-react';
import { useRef } from 'react';
import { AddToLearningButton } from '../../../dictionary/features/add-word-sense-to-learning/add-to-learning-button';
import { useLearningState } from '../../hooks/use-learning-state';
import type { WordSenseDetail as WordSenseDetailType } from '../../services/dictionary.api';

interface WordSenseDetailProps {
  detail: WordSenseDetailType;
}

export function WordSenseDetail({ detail }: WordSenseDetailProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: stateResponse, isLoading: isLoadingState } = useLearningState(
    detail.senseId,
  );
  const learningState = stateResponse?.data;

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
    <div className="space-y-12 pb-12">
      <section className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          {detail.cefrLevel && (
            <div className="inline-flex items-center rounded-full bg-secondary-container px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-on-secondary-container">
              Level: {detail.cefrLevel}
            </div>
          )}

          <div className="flex items-center gap-6">
            <h1 className="font-headline text-6xl font-extrabold tracking-tighter text-primary md:text-8xl capitalize">
              {detail.wordText}
            </h1>
            {defaultPronunciation?.audioUrl && (
              <button
                onClick={() => playAudio(defaultPronunciation.audioUrl!)}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary shadow-md transition-all hover:bg-primary-fixed-dim active:scale-90"
                aria-label="Play pronunciation"
              >
                <Volume2 className="h-7 w-7" />
              </button>
            )}
          </div>

          {defaultPronunciation?.ipa && (
            <p className="text-xl text-on-surface-variant font-medium">
              {defaultPronunciation.ipa} &bull;{' '}
              <span className="italic">{detail.partOfSpeech}</span>
            </p>
          )}
          {!defaultPronunciation?.ipa && detail.partOfSpeech && (
            <p className="text-xl text-on-surface-variant font-medium">
              {detail.partOfSpeech}
            </p>
          )}
        </div>

        {!isLoadingState && learningState && (
          <div className="flex min-w-[280px] flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-[0_12px_32px_rgba(26,27,30,0.06)]">
            <div className="flex items-center justify-between">
              <span className="font-headline font-semibold text-primary">
                Mastery Level
              </span>
              <span className="font-bold text-secondary">
                {masteryPercent}%
              </span>
            </div>
            <ClarionProgress
              value={masteryPercent}
              size="lg"
              indicatorClassName="[&>*]:!bg-tertiary-fixed-dim"
            />
            <p className="text-xs text-on-surface-variant">
              Reviewed {learningState.reviewCount}
              {learningState.reviewCount === 1 ? ' time' : ' times'}.{' '}
              {masteryPercent >= 80
                ? "You're doing great!"
                : 'Keep practicing!'}
            </p>
          </div>
        )}
        {isLoadingState && <Skeleton className="h-32 w-72 rounded-xl" />}
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="space-y-6 rounded-xl bg-surface-container-low p-8 md:col-span-8">
          <div>
            <h3 className="mb-4 font-headline text-2xl font-bold text-primary">
              Definition
            </h3>
            <p className="text-lg leading-relaxed text-on-surface">
              {detail.definition}
            </p>
            {detail.definitionVi && (
              <div className="mt-4 flex items-start gap-3 border-t border-outline-variant/30 pt-4">
                <div className="mt-1 shrink-0 rounded bg-surface-container-high px-2 py-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  VI
                </div>
                <p className="text-base text-on-surface-variant">
                  {detail.definitionVi}
                </p>
              </div>
            )}
          </div>

          {detail.examples.length > 0 && (
            <div>
              <h3 className="mb-4 font-headline text-xl font-semibold text-primary">
                Examples
              </h3>
              <ul className="space-y-4">
                {detail.examples.map((example) => (
                  <li key={example.order} className="flex gap-4">
                    <CheckCircle
                      className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
                      fill="currentColor"
                      stroke="var(--surface-container-low)"
                      strokeWidth={1.5}
                    />
                    <div>
                      <span className="italic leading-relaxed text-on-surface-variant">
                        "{example.text}"
                      </span>
                      {example.translationVi && (
                        <p className="mt-1 text-sm text-on-surface-variant/70">
                          {example.translationVi}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6 md:col-span-4">
          <div className="flex flex-col items-center gap-6 rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 text-center text-white shadow-xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
              <GraduationCap className="h-10 w-10 text-tertiary-fixed-dim" />
            </div>
            <div>
              <h4 className="font-headline text-2xl font-bold">
                Ready to Learn?
              </h4>
              <p className="mt-2 text-sm text-on-primary-container">
                Add this word to your personalized study hub and master it with
                AI-powered drills.
              </p>
            </div>
            <AddToLearningButton
              senseId={detail.senseId}
              isLearning={!!learningState?.isLearning}
              className="w-full flex-col gap-2"
            />
          </div>

          <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
            <h4 className="mb-2 font-headline font-bold text-primary">
              Origins
            </h4>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Explore the etymology and historical usage of{' '}
              <span className="font-semibold text-primary">
                {detail.wordText}
              </span>{' '}
              in the full study session.
            </p>
          </div>
        </div>

        {(detail.synonyms.length > 0 || detail.antonyms.length > 0) && (
          <div className="rounded-xl border border-outline-variant/5 bg-surface-container-lowest p-8 shadow-[0_12px_32px_rgba(26,27,30,0.06)] md:col-span-6">
            {detail.synonyms.length > 0 && (
              <>
                <h3 className="mb-6 font-headline text-2xl font-bold text-primary">
                  Synonyms
                </h3>
                <div className="flex flex-wrap gap-3">
                  {detail.synonyms.map((syn) => (
                    <span
                      key={syn}
                      className="cursor-pointer rounded-full bg-surface-container px-5 py-2.5 font-medium text-on-surface transition-all hover:bg-secondary-container hover:text-on-secondary-container"
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              </>
            )}
            {detail.antonyms.length > 0 && (
              <>
                <h3 className="mb-6 mt-10 font-headline text-2xl font-bold text-primary">
                  Antonyms
                </h3>
                <div className="flex flex-wrap gap-3">
                  {detail.antonyms.map((ant) => (
                    <span
                      key={ant}
                      className="cursor-pointer rounded-full border border-error-container bg-error-container/30 px-5 py-2.5 font-medium text-on-error-container transition-all hover:bg-error-container"
                    >
                      {ant}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {((detail.phrases && detail.phrases.length > 0) ||
          (detail.idioms && detail.idioms.length > 0)) && (
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-8 md:col-span-6">
            <div className="relative z-10">
              <h3 className="mb-6 font-headline text-2xl font-bold text-primary">
                Phrases &amp; Idioms
              </h3>
              <div className="space-y-6">
                {detail.phrases?.map((phrase) => (
                  <div
                    key={phrase}
                    className="rounded-lg border-l-4 border-tertiary-fixed-dim bg-white/60 p-4 backdrop-blur-sm"
                  >
                    <h5 className="mb-1 font-bold text-primary">{phrase}</h5>
                  </div>
                ))}
                {detail.idioms?.map((idiom) => (
                  <div
                    key={idiom}
                    className="rounded-lg border-l-4 border-tertiary-fixed-dim bg-white/60 p-4 backdrop-blur-sm"
                  >
                    <h5 className="mb-1 font-bold text-primary">{idiom}</h5>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-tertiary-fixed-dim opacity-20 blur-3xl" />
          </div>
        )}

        <section className="col-span-12 mt-16">
          <h3 className="lexend text-2xl font-bold text-primary mb-8 text-center">
            Expand Your Vocabulary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { word: 'Ephemeral', pos: 'adj. short-lived' },
              { word: 'Melancholy', pos: 'n. pensive sadness' },
              { word: 'Resilience', pos: 'n. capacity to recover' },
              { word: 'Ethereal', pos: 'adj. extremely delicate' },
            ].map(({ word, pos }) => (
              <div
                key={word}
                className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 text-center hover:shadow-lg transition-shadow cursor-pointer"
              >
                <p className="lexend font-bold text-lg text-primary">{word}</p>
                <p className="text-xs text-on-surface-variant mt-1 italic">
                  {pos}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
