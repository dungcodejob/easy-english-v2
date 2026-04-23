import { CheckCircle } from 'lucide-react';
import type { WordSenseDetail } from '@/modules/learning/services/dictionary.api';

interface DefinitionCardProps {
  detail: Pick<WordSenseDetail, 'definition' | 'definitionVi' | 'examples'>;
}

export function DefinitionCard({ detail }: DefinitionCardProps) {
  return (
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
  );
}
