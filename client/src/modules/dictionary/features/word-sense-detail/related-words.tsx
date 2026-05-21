const RELATED_WORDS = [
  { word: 'Ephemeral', pos: 'adj.', definition: 'short-lived' },
  { word: 'Melancholy', pos: 'n.', definition: 'pensive sadness' },
  { word: 'Resilience', pos: 'n.', definition: 'capacity to recover' },
  { word: 'Ethereal', pos: 'adj.', definition: 'extremely delicate' },
];

export function RelatedWords() {
  return (
    <section className="col-span-12 mt-16">
      <h3 className="lexend text-2xl font-bold text-primary mb-8 text-center">
        Expand Your Vocabulary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {RELATED_WORDS.map(({ word, pos, definition }) => (
          <div
            key={word}
            className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 text-center hover:shadow-lg transition-shadow cursor-pointer"
          >
            <p className="lexend font-bold text-lg text-primary">{word}</p>
            <p className="text-xs text-on-surface-variant mt-1 italic">
              {pos} {definition}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
