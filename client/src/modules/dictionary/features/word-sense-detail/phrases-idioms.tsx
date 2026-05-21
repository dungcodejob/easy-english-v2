interface PhrasesIdiomsProps {
  phrases: string[];
  idioms: string[];
}

export function PhrasesIdioms({ phrases, idioms }: PhrasesIdiomsProps) {
  if (!phrases.length && !idioms.length) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-8 md:col-span-6">
      <div className="relative z-10">
        <h3 className="mb-6 font-headline text-2xl font-bold text-primary">
          Phrases &amp; Idioms
        </h3>
        <div className="space-y-6">
          {phrases.map((phrase) => (
            <div
              key={phrase}
              className="rounded-lg border-l-4 border-tertiary-fixed-dim bg-white/60 p-4 backdrop-blur-sm dark:bg-surface-container/80 "
            >
              <h5 className="mb-1 dark:text-on-surface font-bold text-primary">
                {phrase}
              </h5>
            </div>
          ))}
          {idioms.map((idiom) => (
            <div
              key={idiom}
              className="rounded-lg border-l-4 border-tertiary-fixed-dim bg-white/60 p-4 backdrop-blur-sm dark:bg-surface-container/80"
            >
              <h5 className="mb-1 dark:text-on-surface font-bold text-primary">
                {idiom}
              </h5>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-tertiary-fixed-dim opacity-20 blur-3xl" />
    </div>
  );
}
