import { useLearningState } from '@/modules/learning/hooks/use-learning-state';
import type { WordSenseDetail as WordSenseDetailType } from '@/modules/learning/services/dictionary.api';
import { LearningCtaCard } from '../add-word-sense-to-learning/learning-cta-card';
import { DefinitionCard } from './definition-card';
import { OriginsCard } from './origins-card';
import { PhrasesIdioms } from './phrases-idioms';
import { RelatedWords } from './related-words';
import { SynonymsAntonyms } from './synonyms-antonyms';
import { WordHero } from './word-hero';
export type { LearningStateData } from './types';

interface WordSenseDetailProps {
  detail: WordSenseDetailType;
}

export function WordSenseDetail({ detail }: WordSenseDetailProps) {
  const { data: stateResponse, isLoading: isLoadingState } = useLearningState(
    detail.senseId,
  );
  const learningState = stateResponse?.data ?? null;

  return (
    <div className="space-y-12 pb-12">
      <WordHero
        detail={detail}
        learningState={learningState}
        isLoadingState={isLoadingState}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <DefinitionCard detail={detail} />

        <div className="space-y-6 md:col-span-4">
          <LearningCtaCard
            senseId={detail.senseId}
            isLearning={!!learningState?.isLearning}
          />
          <OriginsCard wordText={detail.wordText} />
        </div>

        <SynonymsAntonyms
          synonyms={detail.synonyms}
          antonyms={detail.antonyms}
        />

        <PhrasesIdioms
          phrases={detail.phrases ?? []}
          idioms={detail.idioms ?? []}
        />

        <RelatedWords />
      </div>
    </div>
  );
}
