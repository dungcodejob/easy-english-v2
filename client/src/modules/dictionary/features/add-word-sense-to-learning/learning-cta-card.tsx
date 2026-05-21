import { AddToLearningButton } from '@/modules/dictionary/features/add-word-sense-to-learning/add-to-learning-button';
import { GraduationCap } from 'lucide-react';

interface LearningCtaCardProps {
  senseId: string;
  isLearning: boolean;
}

export function LearningCtaCard({ senseId, isLearning }: LearningCtaCardProps) {
  return (
    <div
      className="flex flex-col items-center gap-6 rounded-xl bg-gradient-to-br from-primary to-primary-container
    
    dark:from-primary-container dark:to-surface
    p-8 text-center text-white shadow-xl"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
        <GraduationCap className="h-10 w-10 text-tertiary-fixed-dim" />
      </div>
      <div>
        <h4 className="font-headline text-2xl font-bold">Ready to Learn?</h4>
        <p className="mt-2 text-sm text-on-primary-container">
          Add this word to your personalized study hub and master it with
          AI-powered drills.
        </p>
      </div>
      <AddToLearningButton
        senseId={senseId}
        isLearning={isLearning}
        className="w-full flex-col gap-2"
      />
    </div>
  );
}
