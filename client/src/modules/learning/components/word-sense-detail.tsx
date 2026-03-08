import { Badge } from '@/shared/ui/shadcn/badge';
import { Card } from '@/shared/ui/shadcn/card';
import { Progress } from '@/shared/ui/shadcn/progress';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { BookOpen, Quote, Sparkles, TrendingUp, Volume2 } from 'lucide-react';
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

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-5xl md:text-7xl font-black bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent lowercase tracking-tight">
                {detail.wordText}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className="px-4 py-1.5 text-sm font-semibold tracking-wide bg-primary/10 text-primary border-transparent rounded-full"
              >
                {detail.partOfSpeech}
              </Badge>
              {detail.cefrLevel && (
                <Badge
                  variant="outline"
                  className="px-4 py-1.5 text-sm font-bold border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full"
                >
                  {detail.cefrLevel}
                </Badge>
              )}
            </div>

            {/* Pronunciation */}
            {defaultPronunciation && (
              <div className="flex items-center gap-4 mt-2">
                <span className="font-mono text-xl text-muted-foreground/80 font-medium">
                  /{defaultPronunciation.ipa}/
                </span>
                {defaultPronunciation.audioUrl && (
                  <button
                    onClick={() => playAudio(defaultPronunciation.audioUrl!)}
                    className="flex items-center justify-center h-10 w-10 bg-secondary/50 hover:bg-primary hover:text-primary-foreground text-primary rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                )}
                <span className="text-sm uppercase tracking-widest font-bold text-muted-foreground/60">
                  {defaultPronunciation.region || 'US'}
                </span>
              </div>
            )}
          </div>

          <div className="md:mt-4 shrink-0">
            <AddToLearningButton
              senseId={detail.senseId}
              isLearning={!!learningState?.isLearning}
            />
          </div>
        </div>
      </div>

      {/* Learning State Card (If authenticated and loaded) */}
      {!isLoadingState && learningState && (
        <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    Learning Progress
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Reviewed {learningState.reviewCount}{' '}
                    {learningState.reviewCount === 1 ? 'time' : 'times'}
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/20 hover:bg-primary/30 text-primary font-bold px-3 py-1 text-sm border-transparent">
                Mastery Level {learningState.masteryLevel}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Beginner</span>
                <span>Mastered</span>
              </div>
              <Progress
                value={(learningState.masteryLevel / 5) * 100}
                className="h-2.5 bg-primary/10"
              />
            </div>
          </div>
        </Card>
      )}

      {isLoadingState && (
        <Skeleton className="h-32 w-full rounded-xl opacity-50" />
      )}

      <Separator className="opacity-50" />

      {/* Definition section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 text-foreground/80">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Definition</h2>
        </div>
        <div className="bg-card border shadow-sm rounded-2xl p-6 md:p-8 space-y-4">
          <p className="text-xl md:text-2xl leading-relaxed text-foreground font-medium">
            {detail.definition}
          </p>
          {detail.definitionVi && (
            <div className="flex items-start gap-3 mt-4 pt-4 border-t border-border/50">
              <div className="px-2 py-1 bg-muted rounded text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 mt-1">
                VI
              </div>
              <p className="text-lg md:text-xl text-muted-foreground">
                {detail.definitionVi}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Examples section */}
      {detail.examples.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2 text-foreground/80">
            <Quote className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Examples</h2>
          </div>
          <div className="grid gap-4">
            {detail.examples.map((example) => (
              <Card
                key={example.order}
                className="group relative overflow-hidden border-border/60 bg-background/50 backdrop-blur hover:bg-accent/5 transition-colors duration-300 p-6 shadow-sm"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors duration-300" />
                <p className="text-lg font-medium text-foreground mb-2 pl-2">
                  "{example.text}"
                </p>
                {example.translationVi && (
                  <p className="text-base text-muted-foreground pl-2 border-l-2 border-transparent">
                    {example.translationVi}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Synonyms and Antonyms */}
      {(detail.synonyms.length > 0 || detail.antonyms.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {detail.synonyms.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Synonyms
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {detail.synonyms.map((syn) => (
                  <Badge
                    key={syn}
                    variant="secondary"
                    className="bg-secondary/40 text-secondary-foreground hover:bg-secondary font-medium px-4 py-1.5 transition-colors duration-200"
                  >
                    {syn}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {detail.antonyms.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Antonyms
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {detail.antonyms.map((ant) => (
                  <Badge
                    key={ant}
                    variant="outline"
                    className="border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:border-solid hover:bg-accent/50 font-medium px-4 py-1.5 transition-all duration-200"
                  >
                    {ant}
                  </Badge>
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
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  Common Phrases
                </h3>
                <ul className="space-y-2">
                  {detail.phrases.map((phrase) => (
                    <li key={phrase} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                      <span className="text-foreground/80 leading-relaxed">
                        {phrase}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {detail.idioms && detail.idioms.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  Idioms
                </h3>
                <ul className="space-y-2">
                  {detail.idioms.map((idiom) => (
                    <li key={idiom} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500/40 shrink-0" />
                      <span className="text-foreground/80 leading-relaxed">
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
