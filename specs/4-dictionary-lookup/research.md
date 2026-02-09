# Research Notes: Dictionary Lookup Flow

**Date**: 2026-02-10 | **Plan**: [plan.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/4-dictionary-lookup/plan.md)

---

## Phase 1 Scope Decisions

Based on clarification session 2026-02-10:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Authentication | JWT required | Constitution §4 security principle; consistent with project patterns |
| Rate Limiting | None (Phase 1) | Rely on external provider quotas; simplifies initial implementation |
| External Provider | AzVocab only | Focus on single integration; Oxford/FreeDictionary deferred |
| Search Type | Exact match only | Prefix search adds complexity; defer to Phase 2 |
| Request Deduplication | Deferred | Caching layers provide sufficient mitigation |

---

## Caching Strategy

### Decision: 3-Layer Caching

```
Request → Memory Cache → Word DB → Provider Cache → AzVocab API
           (5 min)       (persistent)   (90 days)
```

### Rationale

1. **Memory Cache (Redis/In-process)**: Sub-millisecond response for hot words
2. **Word DB**: Source of truth for enriched internal data
3. **Provider Cache**: Reduces external API calls and costs

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Single Redis cache | Loses audit trail of provider responses |
| No provider cache | Higher API costs, slower cold lookups |
| Write-through to Word DB | Violates CQRS read-path purity |

---

## Provider Decorator Pattern

### Decision: CachingProviderDecorator

Wrap `ILookupProvider` implementations with caching behavior:

```typescript
class CachingProviderDecorator implements ILookupProvider {
  constructor(
    private readonly inner: ILookupProvider,
    private readonly cache: ProviderCacheRepository,
  ) {}

  async lookup(word: string): Promise<WordSnapshot | null> {
    // 1. Check cache
    const cached = await this.cache.findByWord(word, this.inner.name);
    if (cached && !cached.isExpired()) {
      return this.mapResponse(cached.rawResponse);
    }
    
    // 2. Call inner provider
    const result = await this.inner.lookup(word);
    
    // 3. Async cache save (non-blocking)
    this.cache.saveAsync(word, this.inner.name, result);
    
    return result;
  }
}
```

### Rationale

- Keeps providers pure (no DB access)
- Caching logic is isolated and testable
- Easy to add more providers later

---

## Read-Only Repository

### Decision: Separate `IWordReadRepository`

Unlike write repositories, the read repository:
- Returns `WordSnapshot` (denormalized VO)
- Uses eager loading for all relations
- Has no mutation methods

### Rationale

- CQRS compliance (§5)
- Optimized for read performance
- Clear separation from write-path repositories

---

## Event-Driven Enrichment

### Decision: Emit `LookupMissedEvent`

When a word is not found in internal storage:
1. Lookup returns `null` or provider-sourced data
2. `LookupMissedEvent` is emitted asynchronously
3. Separate enrichment handler processes the event

### Rationale

- Decouples read path from write operations
- Non-blocking user response
- Enables batch processing of missed lookups

---

## AzVocab Integration

### Endpoint

```
GET https://azvocab.com/api/v1/words/{word}
```

### Response Mapping

| AzVocab Field | WordSnapshot Field |
|---------------|-------------------|
| `word` | `text` |
| `phonetics[].text` | `pronunciations[].ipa` |
| `phonetics[].audio` | `pronunciations[].audioUrl` |
| `meanings[].partOfSpeech` | `senses[].partOfSpeech` |
| `meanings[].definitions[].definition` | `senses[].definition` |
| `meanings[].definitions[].example` | `senses[].examples[]` |

### Error Handling

| Status | Action |
|--------|--------|
| 200 | Map to WordSnapshot, cache response |
| 404 | Return null, cache 404 (short TTL: 24h) |
| 429 | Throw RateLimitError, do not cache |
| 5xx | Throw ProviderError, do not cache |

---

## Configuration

### Environment Variables

```bash
# AzVocab Provider
AZVOCAB_API_URL=https://azvocab.com/api/v1
AZVOCAB_API_KEY=<secret>
AZVOCAB_TIMEOUT_MS=5000

# Cache TTLs
PROVIDER_CACHE_TTL_DAYS=90
PROVIDER_CACHE_404_TTL_HOURS=24
MEMORY_CACHE_TTL_SECONDS=300
```

---

## Open Items Resolved

- ✅ Which cache layer for provider responses? → PostgreSQL table
- ✅ How to keep providers pure? → Decorator pattern
- ✅ How to trigger enrichment? → Domain event
- ✅ Rate limiting? → None for Phase 1
- ✅ Multiple providers? → AzVocab only for Phase 1
