interface SynonymsAntonymsProps {
  synonyms: string[];
  antonyms: string[];
}

export function SynonymsAntonyms({
  synonyms,
  antonyms,
}: SynonymsAntonymsProps) {
  if (!synonyms.length && !antonyms.length) return null;

  return (
    <div className="rounded-xl border border-outline-variant/5 bg-surface-container-lowest p-8 shadow-[0_12px_32px_rgba(26,27,30,0.06)] md:col-span-6">
      {synonyms.length > 0 && (
        <>
          <h3 className="mb-6 font-headline text-2xl font-bold text-primary">
            Synonyms
          </h3>
          <div className="flex flex-wrap gap-3">
            {synonyms.map((syn) => (
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
      {antonyms.length > 0 && (
        <>
          <h3 className="mb-6 mt-10 font-headline text-2xl font-bold text-primary">
            Antonyms
          </h3>
          <div className="flex flex-wrap gap-3">
            {antonyms.map((ant) => (
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
  );
}
