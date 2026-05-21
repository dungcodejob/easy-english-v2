interface OriginsCardProps {
  wordText: string;
}

export function OriginsCard({ wordText }: OriginsCardProps) {
  return (
    <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
      <h4 className="mb-2 font-headline font-bold text-primary">Origins</h4>
      <p className="text-sm leading-relaxed text-on-surface-variant">
        Explore the etymology and historical usage of{' '}
        <span className="font-semibold text-primary">{wordText}</span> in the
        full study session.
      </p>
    </div>
  );
}
