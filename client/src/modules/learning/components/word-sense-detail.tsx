import { Badge } from '@/shared/ui/shadcn/badge';
import { Card } from '@/shared/ui/shadcn/card';
import { Progress } from '@/shared/ui/shadcn/progress';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Volume2 } from 'lucide-react';
import { useRef } from 'react';
import type { WordSenseDetail as WordSenseDetailType } from '../services/dictionary.api';
import { AddToLearningButton } from './add-to-learning-button';

interface WordSenseDetailProps {
  detail: WordSenseDetailType;
}

export function WordSenseDetail({ detail }: WordSenseDetailProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div>
        <div className="flex flex-wrap items-baseline gap-4 mb-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight lowercase">
            {detail.wordText}
          </h1>
          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm font-mono lowercase tracking-wide"
          >
            {detail.partOfSpeech}
          </Badge>
          {detail.cefrLevel && (
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm border-primary/20 bg-primary/5 text-primary"
            >
              {detail.cefrLevel}
            </Badge>
          )}

          <div className="ml-auto mt-2 sm:mt-0">
            <AddToLearningButton
              senseId={detail.senseId}
              isLearning={!!detail.learningState?.isLearning}
            />
          </div>
        </div>

        {/* Pronunciation */}
        {defaultPronunciation && (
          <div className="flex items-center gap-3 text-muted-foreground mt-3">
            <span className="font-mono text-lg text-foreground/80">
              {defaultPronunciation.ipa}
            </span>
            {defaultPronunciation.audioUrl && (
              <button
                onClick={() => playAudio(defaultPronunciation.audioUrl!)}
                className="p-2 hover:bg-accent rounded-full transition-colors text-primary"
                aria-label="Play pronunciation"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            )}
            <span className="text-xs uppercase tracking-wider font-semibold opacity-60">
              {defaultPronunciation.region || 'US'}
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Definition section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground/90">Definition</h2>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-foreground">
            {detail.definition}
          </p>
          {detail.definitionVi && (
            <p className="text-base text-muted-foreground mt-2 italic">
              Vi: {detail.definitionVi}
            </p>
          )}
        </div>
      </section>

      {/* Examples section */}
      {detail.examples.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground/90">Examples</h2>
          <div className="flex flex-col gap-3">
            {detail.examples.map((example) => (
              <Card
                key={example.order}
                className="p-4 bg-accent/30 border-none shadow-none"
              >
                <p className="text-base font-medium text-foreground mb-1">
                  "{example.text}"
                </p>
                {example.translationVi && (
                  <p className="text-sm text-muted-foreground italic">
                    {example.translationVi}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Synonyms and Antonyms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {detail.synonyms.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Synonyms
            </h3>
            <div className="flex flex-wrap gap-2">
              {detail.synonyms.map((syn) => (
                <Badge
                  key={syn}
                  variant="secondary"
                  className="bg-secondary/50 font-normal py-1.5 hover:bg-secondary"
                >
                  {syn}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {detail.antonyms.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Antonyms
            </h3>
            <div className="flex flex-wrap gap-2">
              {detail.antonyms.map((ant) => (
                <Badge
                  key={ant}
                  variant="outline"
                  className="font-normal border-dashed py-1.5 hover:border-solid hover:bg-accent/50"
                >
                  {ant}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Phrases & Idioms */}
      {((detail.phrases && detail.phrases.length > 0) ||
        (detail.idioms && detail.idioms.length > 0)) && (
        <>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {detail.phrases && detail.phrases.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground/90">
                  Phrases
                </h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  {detail.phrases.map((phrase) => (
                    <li key={phrase}>{phrase}</li>
                  ))}
                </ul>
              </section>
            )}
            {detail.idioms && detail.idioms.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground/90">
                  Idioms
                </h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  {detail.idioms.map((idiom) => (
                    <li key={idiom}>{idiom}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </>
      )}

      {/* Learning State (If authenticated and added) */}
      {detail.learningState && (
        <Card className="mt-8 border-primary/20 bg-primary/5 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary">Learning Progress</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You've reviewed this word {detail.learningState.reviewCount}{' '}
                times.
              </p>
            </div>
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
              Level {detail.learningState.masteryLevel}
            </Badge>
          </div>
          <Progress
            value={(detail.learningState.masteryLevel / 5) * 100}
            className="h-2"
          />
        </Card>
      )}
    </div>
  );
}
