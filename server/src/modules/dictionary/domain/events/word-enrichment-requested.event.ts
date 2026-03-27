import { type EnrichmentContext } from '../providers/lookup-provider.interface';

/**
 * Application event (not a domain aggregate event).
 * Signals that a word lookup returned partial data and
 * remaining definitions should be fetched in the background.
 */
export class WordEnrichmentRequestedEvent {
  constructor(
    public readonly normalizedWord: string,
    public readonly enrichmentContext: EnrichmentContext,
  ) {}
}
