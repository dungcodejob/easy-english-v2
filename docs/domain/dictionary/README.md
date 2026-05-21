# Dictionary Domain

The Dictionary bounded context manages the English vocabulary database. It handles word lookups, full-text search, and automatic enrichment of word data from external providers.

---

## Overview

| Item | Detail |
|------|--------|
| Module path | `server/src/modules/dictionary` |
| Pattern | CQRS + DDD (read/write separated) |
| Aggregate | `Word` |
| External provider | AzVocab API |
| API prefix | `/v1/dictionary` |

---

## Domain Model

### Aggregate Root — `Word`

The central aggregate. Represents a single English word with all its senses, pronunciations, and metadata.

```
Word (AggregateRoot)
 ├── id: uuid
 ├── text: WordText                  — display form (e.g. "Running")
 ├── normalizedText: WordText        — lowercase, trimmed (e.g. "running")
 ├── language: Language              — e.g. "en"
 ├── source: DataSource              — "internal" | "azvocab"
 ├── rank: number | null             — frequency rank in corpus
 ├── frequency: number | null        — usage frequency score
 ├── version: number                 — optimistic concurrency counter
 ├── pronunciations: WordPronunciationVO[]
 ├── senses: WordSenseEntity[]       — one or more meanings
 ├── inflects: Record<string, string[]> | undefined
 └── wordFamily: WordFamily | undefined
```

**Factory methods:**
- `Word.createFromProvider(props)` — used when a word is fetched from external API for the first time. Emits `WordCreatedEvent`.
- `Word.rehydrate(props)` — reconstitutes from database (no events emitted).

**Domain behavior:**
- `word.updateFromProvider(newProps)` — updates an existing word with fresh provider data. No-op if data is identical. Emits `WordUpdatedEvent` and increments `version`.

---

### Entity — `WordSenseEntity`

A single meaning of a word (e.g. "run" as a verb vs. "run" as a noun). One `Word` contains one or more `WordSenseEntity` instances.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Sense identifier |
| `partOfSpeech` | `PartOfSpeech` | e.g. `noun`, `verb`, `adjective` |
| `definition` | `string` | Full English definition |
| `shortDefinition` | `string \| null` | Brief definition for list views |
| `cefrLevel` | `CefrLevel \| null` | Difficulty level: A1–C2 |
| `examples` | `WordExampleVO[]` | Usage example sentences |
| `synonyms` | `string[]` | Related words with same meaning |
| `antonyms` | `string[]` | Words with opposite meaning |
| `definitionVi` | `string \| null` | Vietnamese translation of the definition |
| `collocations` | `Collocation \| undefined` | Common word combinations (pre/suf) |
| `idioms` | `string[] \| undefined` | Idiomatic expressions |
| `phrases` | `string[] \| undefined` | Common phrases |
| `verbPhrases` | `string[] \| undefined` | Phrasal verbs |
| `images` | `string[] \| undefined` | Illustration URLs |

---

## Value Objects

### `WordText`
The word string. Normalized (lowercased, trimmed) for lookups; display form preserved separately.

### `PartOfSpeech`
Valid values: `noun`, `verb`, `adjective`, `adverb`, `pronoun`, `preposition`, `conjunction`, `interjection`, etc.  
Stored lowercase. Created via `PartOfSpeech.from(string)`.

### `CefrLevel`
Valid values: `A1` `A2` `B1` `B2` `C1` `C2`.  
Enforced at construction — invalid values throw `ArgumentInvalidException`.

### `WordExampleVO`

| Field | Type | Description |
|-------|------|-------------|
| `text` | `string` | English example sentence |
| `translationVi` | `string \| null` | Vietnamese translation |
| `order` | `number` | Display order within a sense |

### `WordPronunciationVO`

| Field | Type | Description |
|-------|------|-------------|
| `ipa` | `string` | IPA phonetic notation (e.g. `/rʌn/`) |
| `audioUrl` | `string \| null` | URL to pronunciation audio file |
| `region` | `string` | Dialect (e.g. `US`, `UK`) |

### `DataSource`
Where the word data originated.

| Constant | Value | Meaning |
|----------|-------|---------|
| `DataSource.INTERNAL` | `"internal"` | Manually curated or migrated |
| `DataSource.AZVOCAB` | `"azvocab"` | Fetched from AzVocab external API |

### `Language`
The word's language (e.g. `"en"` for English).

### `WordFamily`
Groups morphologically related words:

```ts
interface WordFamily {
  head: string;          // Root form
  n?: string[];          // Nouns (e.g. ["runner", "run"])
  v?: string[];          // Verbs
  adj?: string[];        // Adjectives
  adv?: string[];        // Adverbs
}
```

### `Collocation`
Common word combinations:

```ts
interface Collocation {
  pre?: {
    v?: string[];    // Verbs that precede (e.g. "make a run")
    adv?: string[];  // Adverbs that precede
  };
  suf?: {
    prep?: string[]; // Prepositions that follow (e.g. "run for")
  };
}
```

---

## Domain Events

| Event | Emitted by | When |
|-------|-----------|------|
| `WordCreatedEvent` | `Word.createFromProvider()` | A word is fetched from provider and stored for the first time |
| `WordUpdatedEvent` | `word.updateFromProvider()` | An existing word's data changes (new senses, pronunciations, etc.) |
| `LookupSucceededEvent` | `LookupWordHandler` | A lookup query resolves (DB or provider) |
| `LookupMissedEvent` | `LookupWordHandler` | A word is not found in DB — also fired after provider fetch to trigger logging/metrics |
| `WordEnrichmentRequestedEvent` | `LookupWordHandler` | Provider has more definitions to fetch in the background |

---

## Application Layer (CQRS Queries)

The dictionary module is **read-only from the application layer** — no Commands exist. All mutation happens as a side effect of queries via domain events.

### `LookupWordQuery`

**Input:** `word: string`, `tenantId: string`, `userId: string`  
**Returns:** `Word[]`

**Flow:**
1. Normalize the word (lowercase, trim)
2. Check internal DB — if found, emit `LookupSucceededEvent` and return
3. If not found, call the external provider (AzVocab) with a 5-second timeout
4. If provider returns data:
   - Emit `WordCreatedEvent` (via aggregate domain events)
   - Emit `LookupSucceededEvent`
   - Emit `LookupMissedEvent` (to log the DB miss)
   - If provider has remaining definitions to fetch → emit `WordEnrichmentRequestedEvent`
   - Return words
5. If provider fails or times out → `ServiceUnavailableException`
6. If completely not found → emit `LookupMissedEvent` + `NotFoundException`

### `SearchWordSensesQuery`

**Input:** `query: string`, `top: number`, `skip: number`  
**Returns:** `{ data: WordSenseSearchReadModel[], count: number }`

Full-text prefix search across word senses. Returns lightweight read models suitable for list display.  
Rate limited: 20 requests / 60s per client.  
This endpoint is **public** (no authentication required).

**Read model fields:** `senseId`, `wordText`, `normalizedText`, `partOfSpeech`, `definition`, `definitionVi`, `shortDefinition`, `cefrLevel`

### `GetWordSenseDetailQuery`

**Input:** `senseId: string`, `tenantId: string`, `userId: string`  
**Returns:** `WordSenseDetailReadModel`

Fetches the complete data for a single word sense, including examples, synonyms, antonyms, idioms, phrases, collocations, and pronunciations.

---

## Infrastructure

### Repositories

**`IWordReadRepository`** — queries only
- `findByWord(normalizedWord)` → `Word[]` — exact match
- `searchByPrefix(query, top, skip)` → paginated `WordSenseSearchReadModel[]`
- `findSenseById(senseId)` → `WordSenseDetailReadModel | null`

**`IWordWriteRepository`** — persistence
- `save(word)` — inserts or updates a `Word` aggregate

**`IProviderCacheRepository`** — raw provider response caching
- Caches raw API responses to avoid redundant external calls

### External Provider — AzVocab

The `AzVocabLookupProvider` implements `ILookupProvider`. On a DB miss, it:
1. Calls AzVocab search API to find matching definitions
2. Fetches up to **8 definitions immediately** (with 200ms delay between calls)
3. If more definitions exist, returns an `EnrichmentContext` for background processing
4. Adapts raw API responses to domain `Word` aggregates via `AzVocabAdapter`

The `CachingProviderDecorator` wraps the provider to cache raw responses in `ProviderResponseCache` (ORM entity), preventing duplicate API calls for the same word.

### Background Enrichment

`WordEnrichmentHandler` listens for `WordEnrichmentRequestedEvent`:
1. Fetches remaining definitions via provider (500ms delay between calls — slower rate)
2. Loads existing `Word` aggregates from DB
3. Calls `word.updateFromProvider()` for each — emits `WordUpdatedEvent` if data changed
4. Errors are swallowed (logged only) — enrichment is non-critical

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/dictionary/search?q=&top=&skip=` | Public | Prefix search word senses |
| `GET` | `/v1/dictionary/senses/:senseId` | JWT | Full word sense detail |
| `GET` | `/v1/dictionary/lookup/:word` | JWT | Full word lookup (with provider fallback) |

### Search response shape

```json
{
  "data": [
    {
      "senseId": "uuid",
      "wordText": "run",
      "partOfSpeech": "verb",
      "shortDefinition": "Move at a speed faster than a walk",
      "cefrLevel": "A1"
    }
  ],
  "pagination": { "top": 20, "skip": 0, "count": 42, "hasMore": true }
}
```

### Word sense detail response shape

```json
{
  "data": {
    "senseId": "uuid",
    "wordText": "run",
    "partOfSpeech": "verb",
    "definition": "Move at a speed faster than a walk, never having both or all the feet on the ground at the same time.",
    "shortDefinition": "Move fast on foot",
    "cefrLevel": "A1",
    "definitionVi": "Chạy — di chuyển nhanh hơn đi bộ",
    "examples": [
      { "text": "she ran to the door", "translationVi": "cô ấy chạy đến cửa", "order": 1 }
    ],
    "synonyms": ["sprint", "dash", "jog"],
    "antonyms": ["walk", "crawl"],
    "idioms": ["run out of steam"],
    "phrases": ["in the long run"],
    "pronunciations": [
      { "ipa": "/rʌn/", "audioUrl": "https://...", "region": "US" }
    ]
  }
}
```

---

## Data Flow Diagram

```
User types word
      │
      ▼
GET /dictionary/search?q=run
      │
      ▼
SearchWordSensesQuery
      │
      ▼
IWordReadRepository.searchByPrefix()
      │
      ▼
Returns WordSenseSearchReadModel[] (list view)

─────────────────────────────────────────────────

User clicks a word sense
      │
      ▼
GET /dictionary/senses/:senseId
      │
      ▼
GetWordSenseDetailQuery
      │
      ▼
IWordReadRepository.findSenseById()
      │
      ▼
Returns WordSenseDetailReadModel (detail view)

─────────────────────────────────────────────────

GET /dictionary/lookup/:word
      │
      ▼
LookupWordQuery
      │
      ├─ DB hit → LookupSucceededEvent → return Word[]
      │
      └─ DB miss
            │
            ▼
      AzVocab provider (5s timeout)
            │
            ├─ Found → WordCreatedEvent + LookupSucceededEvent + LookupMissedEvent
            │          └─ if more defs → WordEnrichmentRequestedEvent
            │                                │
            │                                ▼
            │                     Background: WordEnrichmentHandler
            │                     fetches remaining defs, updateFromProvider()
            │
            └─ Not found → LookupMissedEvent → NotFoundException
```

---

## Relationships to Other Domains

| Domain | Relationship |
|--------|-------------|
| **Learning/Progress** | `UserWordSenseProgress` references `WordSense.id` — users enroll word senses from the dictionary into their learning list |
| **Learning/Topic** | `TopicWord` references `WordSense.id` — users add dictionary words to topics |
| **Flashcard** | Flashcards created from dictionary have `source = "dictionary"` and reference `WordSense.id` |

The Dictionary domain has **no dependency on other domains**. It is a pure read domain — other domains reference it by sense ID.
