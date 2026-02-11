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

### Two-Step Data Flow

The AzVocab API requires **two sequential calls** to get complete word data:

```
1. Search(word) → AzVocabSearchResponseDto[] (basic metadata + def IDs)
2. For each def → GetDefinition(defId) → AzVocabDefinitionResponseDto (full details)
```

The **search** endpoint returns basic word info (vocab, pos, rank, pronunciations) and a list of definition stubs with IDs. To get the full definition data (samples, collocations, images, etc.), a separate **getDefinition** call per definition is required.

### Endpoints

#### 1. Search: `POST /api/vocab/search?q={word}`

- **Method**: `POST` (body is `null`, query in URL param)
- **Auth**: Cookie-based (`Cookie: _azvocab_token=...; _azvocab_refresh=...`)
- **Response**: `AzVocabSearchResponseDto[]`
- **Returns**: Array of word entries with basic metadata and definition IDs
- Each entry contains: `id`, `vocab`, `pos`, `pron_uk/us`, `uk/us` (audio), `rank`, `freq`, `family`, `inflects`, and `defs[]` (definition stubs with `id`, `def`, `vi`, `pos`)

#### 2. Get Definition: `GET /_next/data/{buildId}/vi/definition/{defId}.json?id={defId}`

- **Method**: `GET`
- **Auth**: Cookie-based (same cookie)
- **Headers**: `x-nextjs-data: 1` (required for Next.js data route)
- **Response**: `AzVocabDefinitionResponseDto`
- **Returns**: `{ pageProps: { def: DefinitionDto, vocab: AzVocabSearchResponseDto } }`
- Contains full definition details: `samples[]`, `synonyms[]`, `antonyms[]`, `colloc`, `images[]`, `idioms[]`, `phrases[]`, `verb_phrases[]`, `level`

> [!IMPORTANT]
> The `buildId` changes with each deployment of azvocab.com. Must be configured via `AZVOCAB_BUILD_ID` env var.

### Architecture: 3-File Split

```
azvocab/
├── azvocab.http-client.ts     # Pure HTTP client (search + getDefinition)
├── azvocab.adapter.ts         # DTO → WordSnapshot mapping (merges search + definitions)
└── azvocab.lookup-provider.ts # Implements ILookupProvider, orchestrates client + adapter
```

| File | Responsibility | Dependencies |
|------|---------------|--------------|
| `http-client` | HTTP calls, cookie auth, headers, error handling | `HttpService`, `ConfigService` |
| `adapter` | Maps `AzVocabSearchResponseDto[]` + `AzVocabDefinitionResponseDto[]` → `WordSnapshot` | Value objects only |
| `lookup-provider` | Orchestrates: search → getDefinitions → adapt | `http-client`, `adapter` |

### Response Mapping

**From Search (base metadata):**

| AzVocab Field | WordSnapshot Field | Notes |
|---------------|-------------------|-------|
| `vocab` | `text` | From primary entry |
| `pron_uk` / `pron_us` | `pronunciations[].ipa` | From primary entry |
| `uk` / `us` | `pronunciations[].audioUrl` | From primary entry |
| `rank` | `rank` | From primary entry |
| `freq` | `frequency` | From primary entry |
| `family` | `wordFamily` | From primary entry |
| `inflects` | `inflects` | From primary entry |

**From GetDefinition (per definition):**

| AzVocab Field | WordSnapshot Field | Notes |
|---------------|-------------------|-------|
| `def.pos` | `senses[].partOfSpeech` | Fallback to search entry `pos` |
| `def.def` | `senses[].definition` | |
| `def.vi` | `senses[].definitionVi` | |
| `def.level` | `senses[].cefrLevel` | |
| `def.samples[]` | `senses[].examples[]` | Full sample sentences |
| `def.synonyms[]` | `senses[].synonyms` | |
| `def.antonyms[]` | `senses[].antonyms` | |
| `def.colloc` | `senses[].collocations` | |
| `def.idioms[]` | `senses[].idioms` | |
| `def.phrases[]` | `senses[].phrases` | |
| `def.verb_phrases[]` | `senses[].verbPhrases` | |
| `def.images[]` | `senses[].images` | |

### Error Handling

| Endpoint | Status | Action |
|----------|--------|--------|
| Search | 200 (empty []) | Return null snapshot |
| Search | 404 | Return null, cache 404 (24h TTL) |
| Search | 429 | Throw RateLimitError, do not cache |
| Search | 5xx | Throw ProviderError, do not cache |
| GetDef | 404 | Skip this definition, continue others |
| GetDef | 429/5xx | Log warning, return partial data (search-only) |

---

## Configuration

### Environment Variables

```bash
# AzVocab Provider
AZVOCAB_API_URL=https://azvocab.com
AZVOCAB_COOKIE=_azvocab_token=...; _azvocab_refresh=...
AZVOCAB_BUILD_ID=<nextjs-build-id>
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
