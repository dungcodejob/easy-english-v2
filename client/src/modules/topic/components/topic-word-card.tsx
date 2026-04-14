/**
 * TopicWordCard — Topic module (presentational)
 *
 * Bento vocabulary card matching the "Clarion Study" mockup.
 * Shows word title, pronunciation, definition, mastery progress bar,
 * and a remove button on hover.
 *
 * Pure presentational — emits `onRemove` callback, parent handles mutation.
 *
 * [MOCK] mastery percentage — backend does not support per-word mastery yet.
 *        Uses a deterministic hash of word.id to generate a stable fake %.
 */

import { DictionaryRoutes } from '@/shared/constants';
import { Link } from '@tanstack/react-router';
import { Trash2, Volume2 } from 'lucide-react';
import { useMemo } from 'react';
import type { TopicWord } from '../services/topic.api';

interface TopicWordCardProps {
  word: TopicWord;
  onRemove?: (word: TopicWord) => void;
}

// [MOCK] Deterministic pseudo-random mastery % from word id
function mockMastery(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 101;
}

function getMasteryColor(pct: number): string {
  if (pct >= 70) return 'bg-secondary';
  if (pct >= 40) return 'bg-tertiary-fixed-dim';
  return 'bg-error/60';
}

export function TopicWordCard({ word, onRemove }: TopicWordCardProps) {
  // [MOCK] mastery — replace with real data when backend supports it
  const mastery = useMemo(() => mockMastery(word.id), [word.id]);

  return (
    <article className="group relative cursor-pointer rounded-xl border-b-4 border-transparent bg-surface-container-lowest p-8 transition-all duration-300 hover:border-secondary hover:shadow-2xl hover:shadow-black/[0.04]">
      {/* Header: word + audio */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            to={DictionaryRoutes.senseDetail(word.wordSenseId)}
            className="font-headline text-2xl font-bold text-on-primary-fixed transition-colors group-hover:text-secondary"
          >
            {word.wordText ?? '—'}
          </Link>
          {word.partOfSpeech && (
            <p className="text-sm italic text-outline">{word.partOfSpeech}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-outline transition-colors group-hover:bg-primary-fixed group-hover:text-primary">
          <Volume2 className="h-5 w-5" />
        </div>
      </div>

      {/* Definition */}
      {word.definition && (
        <p className="mb-6 line-clamp-2 leading-relaxed text-on-surface-variant">
          {word.definition}
        </p>
      )}

      {/* [MOCK] Mastery progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-outline">
          <span>Mastery</span>
          <span>{mastery}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className={`h-full rounded-full ${getMasteryColor(mastery)}`}
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>

      {/* Remove button — appears on hover */}
      {onRemove && (
        <button
          onClick={() => onRemove(word)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-outline opacity-0 transition-all hover:bg-error-container/30 hover:text-error group-hover:opacity-100"
          aria-label="Remove word from topic"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </article>
  );
}
