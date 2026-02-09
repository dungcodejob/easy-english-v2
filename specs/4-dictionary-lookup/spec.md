# Feature Specification: Dictionary Lookup Flow

**Feature Branch**: `4-dictionary-lookup`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: Technical specification for a read-optimized, side-effect-free Dictionary Lookup flow in a language-learning platform.

---

## Purpose & Scope

### What Lookup Is Responsible For

The Lookup flow provides real-time, read-only access to word definitions and linguistic data for learners. Its core responsibilities are:

1. **Instant Word Retrieval** - Returning word definitions, pronunciations, examples, and translations with minimal latency
2. **Multi-Source Resolution** - Aggregating data from internal storage and external dictionary providers when needed
3. **Snapshot Delivery** - Returning consistent, read-only snapshots of word data suitable for display
4. **Event Signaling** - Emitting events when words are not found internally, enabling downstream enrichment processes

### What Lookup Explicitly Does NOT Do

- **NO Direct Database Writes** - Lookup never persists data directly; it is purely a query operation
- **NO State Mutation** - Lookup does not modify any aggregate or domain entity state
- **NO Blocking Operations** - Lookup does not wait for external providers to persist data before responding
- **NO Import Logic** - Word import and batch processing are handled by separate Import flows
- **NO Admin Editing** - Content management and editorial workflows are outside Lookup scope
- **NO Backfill Jobs** - Data migration and historical enrichment are separate infrastructure concerns

---

## Clarifications

### Session 2026-02-10

- Q: Is authentication required for the lookup endpoint? → A: Authenticated only - JWT required, anonymous access blocked
- Q: How should rate limiting work for lookup? → A: No rate limiting on lookup endpoint; rely on external provider quotas only
- Q: How should concurrent identical requests be deduplicated? → A: Skip for Phase 1; caching handles most cases; revisit if measured need arises
- Q: Should prefix search/autocomplete be included in Phase 1? → A: Defer to Phase 2; focus on exact word lookup only
- Q: Which external providers should be implemented? → A: AzVocab only for Phase 1; Oxford and FreeDictionary deferred

---

## High-Level Architecture

### Module Structure (Aligned with Project Patterns)

```
modules/dictionary/
├── application/
│   ├── queries/
│   │   ├── lookup-word.query.ts           # Query DTO (extends Query base)
│   │   └── lookup-word.handler.ts         # @QueryHandler - orchestrates lookup flow
│   └── events/
│       ├── lookup-missed.handler.ts       # @OnEvent - handles async enrichment
│       └── lookup-succeeded.handler.ts    # @OnEvent - handles analytics/caching
├── domain/
│   ├── entities/
│   │   └── word.entity.ts                 # Word AggregateRoot (for write operations)
│   ├── value-objects/
│   │   ├── word-snapshot.vo.ts            # Read-only projection (extends ValueObject)
│   │   ├── pronunciation.vo.ts            # IPA, audioUrl, region
│   │   └── sense.vo.ts                    # Definition, examples, synonyms
│   ├── events/
│   │   ├── lookup-missed.event.ts         # extends DomainEvent
│   │   └── lookup-succeeded.event.ts      # extends DomainEvent
│   ├── repositories/
│   │   └── word-read.repository.interface.ts  # Read-only repository interface
│   └── providers/
│       ├── lookup-provider.interface.ts   # Pure provider contract
│       └── lookup-provider-factory.interface.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── word.orm-entity.ts             # MikroORM entity
│   │   ├── word-sense.orm-entity.ts
│   │   ├── word-pronunciation.orm-entity.ts
│   │   ├── word-example.orm-entity.ts
│   │   └── provider-response-cache.orm-entity.ts  # Raw API response cache
│   ├── repositories/
│   │   └── word-read.repository.ts        # MikroORM implementation
│   ├── mappers/
│   │   └── word-snapshot.mapper.ts        # ORM entities → WordSnapshot
│   └── providers/
│       ├── caching-provider.decorator.ts  # Cache wrapper for any provider
│       └── azvocab/
│           ├── azvocab.http-client.ts     # Pure HTTP client
│           ├── azvocab.adapter.ts         # DTO → WordSnapshot mapping
│           └── azvocab.lookup-provider.ts # implements LookupProvider (NO DB)
├── dto/
│   ├── requests/
│   │   └── lookup-word.request.dto.ts
│   └── responses/
│       └── word-snapshot.response.dto.ts
├── controllers/
│   └── lookup.controller.ts               # REST endpoint
└── dictionary.module.ts
```

### Read Path (Lookup Query Flow)

```
┌─────────────┐     ┌────────────────────┐     ┌──────────────────┐
│   Client    │────▶│ LookupController   │────▶│ LookupWordQuery  │
│   Request   │     │ (REST)             │     │ (CQRS Query)     │
└─────────────┘     └────────────────────┘     └──────────────────┘
                                                       │
                                                       ▼
                                           ┌────────────────────────┐
                                           │ LookupWordHandler      │
                                           │ (@QueryHandler)        │
                                           └────────────────────────┘
                                                       │
                    ┌──────────────────────────────────┼──────────────────────────────────┐
                    │ 1. Memory Cache                  │ 2. Word DB                       │ 3. Provider Layer
                    ▼                                  ▼                                  ▼
           ┌─────────────────┐              ┌─────────────────────┐           ┌─────────────────────────────┐
           │ CacheManager    │              │ WordReadRepository  │           │ CachingProviderDecorator    │
           │ (Redis/Memory)  │              │ (Read-only)         │           │ (wraps LookupProvider)      │
           └─────────────────┘              └─────────────────────┘           └─────────────────────────────┘
                    │                                  │                                  │
                    │                                  │                    ┌─────────────┴─────────────┐
                    │                                  │                    │ 3a. Provider Cache        │ 3b. External API
                    │                                  │                    ▼                           ▼
                    │                                  │         ┌─────────────────────┐    ┌─────────────────────┐
                    │                                  │         │ ProviderCacheRepo   │    │ AzVocabProvider     │
                    │                                  │         │ (Raw Response DB)   │    │ (Pure HTTP)         │
                    │                                  │         └─────────────────────┘    └─────────────────────┘
                    │                                  │                    │                           │
                    │                                  │                    │ (cache miss)              │
                    │                                  │                    │◀──────────────────────────┘
                    │                                  │                    │ (async save to cache)     
                    └────────────────────┬─────────────┴────────────────────┘
                                         ▼
                              ┌─────────────────────┐
                              │ WordSnapshot (VO)   │◀── Immutable, cacheable
                              └─────────────────────┘
                                         │
                                         ▼ (on DB miss - for async enrichment)
                              ┌─────────────────────┐
                              │ EventEmitter2       │
                              │ emit('LookupMissed')│
                              └─────────────────────┘
```

### Provider Response Cache Flow

```
CachingProviderDecorator.lookup(word)
  │
  ├─▶ 1. Query ProviderResponseCacheRepository
  │       WHERE normalizedWord = word AND provider = "azvocab" AND expiresAt > NOW()
  │
  ├─▶ 2. If CACHE HIT:
  │       → Parse rawResponse JSON → Map to WordSnapshot → Return
  │
  └─▶ 3. If CACHE MISS:
          → Call wrapped LookupProvider.lookup(word)
          → If result found:
              → Async save to ProviderResponseCacheEntity (fire-and-forget)
              → Return WordSnapshot immediately
          → If not found:
              → Return null
```

### Write Path (Async Enrichment - Decoupled)

```
┌─────────────────────┐     ┌─────────────────────────┐     ┌──────────────────┐
│ LookupMissedEvent   │────▶│ LookupMissedHandler     │────▶│ ImportService    │
│ (Domain Event)      │     │ (@OnEvent)              │     │ (Async Worker)   │
└─────────────────────┘     └─────────────────────────┘     └──────────────────┘
                                                                    │
                                                                    ▼
                                                        ┌──────────────────────┐
                                                        │ Word Aggregate       │
                                                        │ (AggregateRoot)      │
                                                        │ → persist to DB      │
                                                        └──────────────────────┘
```

### DDD Pattern Application

| Pattern | Usage in Dictionary Module |
|---------|----------------------------|
| **AggregateRoot** | `WordEntity` - for write operations (import, edit) |
| **ValueObject** | `WordSnapshot`, `Pronunciation`, `Sense` - immutable read models |
| **DomainEvent** | `LookupMissedEvent`, `LookupSucceededEvent` - async side effects |
| **Repository** | `IWordReadRepository` - read-only queries, `IWordAggregateRepository` - writes |
| **Mapper** | `WordSnapshotMapper` - ORM entities → ValueObject |
| **Factory** | `LookupProviderFactory` - creates appropriate provider based on config |
| **Query (CQRS)** | `LookupWordQuery` + `LookupWordHandler` - read path |
| **Command (CQRS)** | `ImportWordCommand` + `ImportWordHandler` - write path (separate flow) |

### Component Responsibilities

| Component | Responsibility | DB Access | Side Effects |
|-----------|----------------|-----------|--------------|
| `LookupController` | HTTP → Query dispatch | ❌ | ❌ |
| `LookupWordHandler` | Orchestrate lookup logic | ✅ (read-only) | ✅ (emit events) |
| `WordReadRepository` | Query DB for WordSnapshot | ✅ (read-only) | ❌ |
| `LookupProvider` | Fetch from external APIs | ❌ | ❌ |
| `LookupProviderFactory` | Select/create provider | ❌ | ❌ |
| `CachingProviderDecorator` | Wrap provider with cache | ✅ (read+async write) | ❌ |
| `ProviderCacheRepository` | Query/save raw responses | ✅ | ❌ |
| `WordSnapshotMapper` | ORM → ValueObject | ❌ | ❌ |
| `LookupMissedHandler` | Handle async enrichment | ✅ (write) | ✅ |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Word Lookup (Priority: P1)

A learner encounters an unfamiliar word while studying and wants to quickly understand its meaning without leaving the learning context.

**Why this priority**: This is the core value proposition of the Dictionary module. Every learner interaction starts with looking up a word, making this the fundamental use case that must work flawlessly.

**Independent Test**: Can be fully tested by entering any common English word and verifying that definitions, pronunciation, and examples are displayed within acceptable response time.

**Acceptance Scenarios**:

1. **Given** a learner is on the study page, **When** they look up a common word like "apple", **Then** they receive the full definition with pronunciation and examples within 1 second
2. **Given** a learner is on the study page, **When** they look up a word that exists in the internal database, **Then** the cached/stored result is returned without calling external providers
3. **Given** a learner is on the study page, **When** they look up a word, **Then** the system displays the word's part of speech, definition(s), phonetic pronunciation, and example sentences

---

### User Story 2 - External Provider Fallback (Priority: P2)

A learner looks up a rare or newly added word that doesn't exist in the internal database, and the system seamlessly fetches it from external providers.

**Why this priority**: Ensures comprehensive dictionary coverage without requiring manual data entry for every possible word. Critical for user experience when encountering specialized vocabulary.

**Independent Test**: Can be tested by looking up a rare or technical term that is intentionally not pre-populated in the internal store, verifying that external provider data is returned.

**Acceptance Scenarios**:

1. **Given** a learner looks up a word not in the internal database, **When** the lookup is performed, **Then** the system queries external providers and returns the result
2. **Given** external providers are queried for a missing word, **When** a result is found, **Then** the response format is identical to internally stored words
3. **Given** external providers are queried, **When** a result is returned to the learner, **Then** an event is emitted to trigger background enrichment (the learner does not wait for this)

---

### User Story 3 - Graceful Degradation (Priority: P2)

When external providers are unavailable or slow, the system provides partial results or meaningful error messages without hanging or crashing.

**Why this priority**: Critical for user trust and experience. Users should never be left with a frozen screen or cryptic error when infrastructure issues occur.

**Independent Test**: Can be tested by simulating provider timeouts or failures and verifying the system returns partial data or user-friendly error messages within acceptable time limits.

**Acceptance Scenarios**:

1. **Given** the primary external provider times out, **When** a lookup is performed, **Then** the system falls back to secondary providers
2. **Given** all external providers are unavailable, **When** a lookup is performed for an unknown word, **Then** the system returns a "word not found" message within 3 seconds
3. **Given** a provider returns partial data (e.g., definition but no examples), **When** the lookup completes, **Then** available data is displayed and missing sections are gracefully omitted

---

### User Story 4 - High-Volume Concurrent Lookups (Priority: P3)

Multiple learners perform simultaneous lookups during peak usage without experiencing degraded performance.

**Why this priority**: Essential for scalability and platform reliability, but secondary to core functionality working correctly.

**Independent Test**: Can be tested through load testing where 500+ concurrent lookup requests are sent and response times/error rates are measured.

**Acceptance Scenarios**:

1. **Given** 500 concurrent users perform lookups, **When** requests are processed, **Then** 95% of requests complete within 2 seconds
2. **Given** high system load, **When** a learner performs a lookup, **Then** cache hits are prioritized to reduce database and external provider load
3. **Given** multiple users look up the same word simultaneously, **When** the word is not in cache, **Then** only one external provider call is made (request deduplication)

---

### Edge Cases

- What happens when a lookup request contains special characters or non-Latin scripts?
  - System validates input and returns appropriate error for unsupported character sets
- How does the system handle extremely long word inputs?
  - Input is truncated or rejected with a validation error (max 100 characters)
- What happens if the database connection is lost during a lookup?
  - System gracefully falls back to external providers only, or returns cached data if available
- How are homographs (same spelling, different meanings) handled?
  - All meanings are returned in the snapshot with clear part-of-speech distinctions

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST return word definitions within 2 seconds for cache/database hits
- **FR-002**: System MUST support fallback to external providers when words are not found internally
- **FR-003**: System MUST emit a domain event when a word is looked up but not found in internal storage
- **FR-004**: System MUST NOT perform any database write operations during the lookup flow
- **FR-005**: External provider integrations MUST NOT have direct database access or side effects
- **FR-006**: System MUST aggregate results from multiple external providers when primary provider returns incomplete data
- **FR-007**: System MUST validate lookup input (word text) and reject malformed requests
- **FR-008**: System MUST support AzVocab as external dictionary provider for Phase 1 *(Oxford, FreeDictionary deferred to Phase 2)*
- **FR-009**: System MUST return consistent response format regardless of data source (cache, DB, or provider)
- **FR-010**: System MUST implement request timeout handling with configurable thresholds
- **FR-011**: *(Deferred to Phase 2)* System MAY deduplicate concurrent requests for the same word; caching provides sufficient mitigation for Phase 1
- **FR-012**: System MUST require valid JWT authentication for all lookup requests; anonymous access is blocked

### Key Entities

#### Existing Persistence Model (Source Data)

The lookup flow reads from existing entities in the database:

- **WordEntity**: Core word storage with `text`, `normalizedText`, `language`, `rank`, `frequency`, `source`, `inflects` (verb conjugations, noun plurals, etc.), and `wordFamily` (related word forms). Unique constraint on `[normalizedText, language]`.

- **WordSenseEntity**: Definitions tied to a Word, containing `partOfSpeech`, `definition`, `shortDefinition`, `cefrLevel`, `synonyms`, `antonyms`, `collocations`, `relatedWords`, `idioms`, `phrases`, `images`, and Vietnamese translation (`definitionVi`).

- **WordPronunciationEntity**: Phonetic data including `ipa`, `audioUrl`, and `region` (e.g., UK/US).

- **WordExampleEntity**: Example sentences for a sense with `text`, `translationVi`, and display `order`.

#### Read Model (Response)

- **WordSnapshot**: Read-only projection aggregated from the entities above. Denormalized for fast API responses. Contains all data needed for display without lazy loading. Mapped at query time, never persisted.

#### Provider Response Cache (NEW)

- **ProviderResponseCacheEntity**: Stores raw API responses from external providers for reuse.
  - `id`: UUID primary key
  - `normalizedWord`: Indexed for fast lookup (e.g., "apple")
  - `provider`: Source identifier ("azvocab" | "oxford" | "freedictionary")
  - `rawResponse`: Full JSON response from provider
  - `httpStatus`: HTTP status code (200, 404, 500...)
  - `createdAt`: Timestamp of cache entry
  - `expiresAt`: Cache TTL expiration (configurable, default 90 days)
  - Unique constraint on `[normalizedWord, provider]`

**Why Provider Cache?**
- Reduces external API calls and costs
- Faster response for previously-fetched words
- Provides audit trail of raw provider data
- Enables resilience when providers are unavailable

#### Domain Events

- **LookupMissedEvent**: Emitted when a lookup cannot be fulfilled from internal storage. Contains the searched word, timestamp, and user/session context. Triggers asynchronous enrichment workflows.

#### Provider Abstraction

- **LookupProvider**: Interface for external dictionary sources. Returns data in a format that can be mapped to WordSnapshot. Providers are pure (no side effects, no database access).

---

## Core Models & Design Rationale

### WordSnapshot Structure

The WordSnapshot is a flattened, read-optimized projection of the normalized entity model:

```
WordSnapshot
├── id                    # WordEntity.id
├── text                  # WordEntity.text
├── normalizedText        # WordEntity.normalizedText
├── language              # WordEntity.language
├── rank                  # WordEntity.rank (word frequency ranking)
├── frequency             # WordEntity.frequency
├── source                # "internal" | "azvocab" | "oxford" | "freedictionary"
├── inflects              # WordEntity.inflects (verb forms, plurals, etc.)
├── wordFamily            # WordEntity.wordFamily (noun/verb/adj/adv forms)
├── pronunciations[]      # Mapped from WordPronunciationEntity
│   ├── ipa
│   ├── audioUrl
│   └── region            # "uk" | "us"
└── senses[]              # Mapped from WordSenseEntity
    ├── partOfSpeech
    ├── definition
    ├── shortDefinition
    ├── cefrLevel         # A1, A2, B1, B2, C1, C2
    ├── definitionVi      # Vietnamese translation
    ├── synonyms[]
    ├── antonyms[]
    ├── collocations[]
    ├── relatedWords[]
    ├── idioms[]
    ├── phrases[]
    ├── images[]
    └── examples[]        # Mapped from WordExampleEntity
        ├── text
        ├── translationVi
        └── order
```

### Why WordSnapshot Instead of Aggregate

The Lookup flow uses **WordSnapshot** (a read-only value object) rather than returning the full Word Aggregate for several reasons:

1. **Query Optimization** - Snapshots are denormalized, avoiding N+1 queries for pronunciations, senses, and examples
2. **Immutability** - Snapshots cannot be accidentally modified, preserving domain integrity
3. **Decoupling** - The read model evolves independently from the write model (entity structure)
4. **Caching Friendliness** - Simple value objects serialize efficiently for cache storage
5. **API Stability** - Response contracts remain stable even as the internal entity model changes

### Event-Driven Enrichment

When a word is not found internally, the system:
1. Fetches from external providers
2. Returns the result to the user immediately
3. Emits **LookupMissedEvent** for async processing
4. Background workers persist enriched data for future lookups

This pattern ensures sub-second responses while maintaining eventual data consistency.

---

## Interfaces & Contracts

### LookupQueryService

The main orchestrator for lookup operations:
- Accepts a word query request
- Coordinates resolution across cache, database, and providers
- Returns WordSnapshot or appropriate error
- Emits events for missed lookups

### LookupProvider

Pure interface for external dictionary access:
- Accepts word text, returns WordSnapshot or null
- No database access
- No side effects
- Supports timeout configuration
- Provides health/availability status

### LookupProviderFactory

Selects appropriate provider(s) based on:
- Word language/locale
- Provider availability status
- Configuration priority order
- Fallback chain rules

### WordReadRepository

Read-optimized repository interface:
- Query by word text (exact match)
- *(Phase 2)* Query by word text prefix for autocomplete
- Returns WordSnapshot
- Supports caching layer integration

---

## Error Handling

### Provider Failures

| Scenario | Handling |
|----------|----------|
| Primary provider timeout | Fallback to secondary provider with shorter timeout |
| All providers fail | Return "word not found" with user-friendly message |
| Provider returns malformed data | Log error, skip provider, try next in chain |
| Provider rate limited | Circuit breaker triggers, use cached data if available |

### Partial Data Scenarios

- If provider returns definition but no examples: Display available data, omit examples section
- If provider returns definition but no audio: Display text data, hide audio player
- If multiple providers return conflicting data: Merge using priority rules, prefer primary provider

### Timeouts and Fallbacks

- **Cache lookup**: 50ms timeout
- **Database lookup**: 200ms timeout
- **External provider**: 2000ms timeout (configurable per provider)
- **Total request budget**: 3000ms maximum
- If budget exhausted, return best available result or error

---

## Non-Functional Requirements

### Performance Expectations

- **Cache hit response time**: < 100ms (P95)
- **Database hit response time**: < 300ms (P95)
- **External provider response time**: < 2500ms (P95)
- **End-to-end latency**: < 3000ms (P99)

### Scalability Considerations

- Horizontal scaling via stateless query services
- Read replicas for database queries
- Distributed caching for frequently accessed words
- Request deduplication for concurrent identical queries
- Circuit breakers to protect against cascade failures

### Provider Response Cache Strategy

| Setting | Default Value | Rationale |
|---------|---------------|----------|
| **Cache TTL** | 90 days | Dictionary data rarely changes |
| **Max cache size** | Unlimited (cleanup job) | Disk-based, low cost per entry |
| **Cache on 404** | Yes (30 days TTL) | Avoid retrying non-existent words |
| **Async write** | Fire-and-forget | Don't block response on cache save |
| **Compression** | gzip on rawResponse | Reduce storage for large responses |

**Cache Invalidation Triggers:**
- Manual admin purge for specific words
- Provider version change (bulk invalidation)
- TTL expiration (automatic)

### Observability

- **Logging**: Structured logs for each lookup request including source (cache/DB/provider), duration, and outcome
- **Metrics**: Counters for cache hit rate, provider usage, error rates, and latency histograms
- **Tracing**: Distributed trace IDs for end-to-end request tracking across services
- **Alerting**: Threshold-based alerts for error rate spikes, latency degradation, and provider availability

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of word lookups for previously-seen words complete within 500ms
- **SC-002**: 90% of word lookups for new words (requiring external provider) complete within 2 seconds
- **SC-003**: System maintains 99.9% uptime for lookup functionality
- **SC-004**: Cache hit rate exceeds 70% after 30 days of production usage
- **SC-005**: Zero database write operations occur during lookup request handling
- **SC-006**: Provider fallback successfully handles 99% of primary provider failures without user-visible errors
- **SC-007**: System supports 500 concurrent lookup requests without degradation

---

## Out of Scope

The following concerns are explicitly excluded from the Lookup flow specification:

- **Import Logic** - Bulk word ingestion, file parsing, and batch processing flows
- **Admin Editing** - Content management, editorial workflows, and word corrections
- **Backfill Jobs** - Data migration, historical enrichment, and database synchronization
- **User Dictionary** - Personal word lists, favorites, and study progress tracking
- **Spaced Repetition** - Learning algorithms and review scheduling
- **Authentication Flow** - User login, session management, and authorization

---

## Future Extensions

The following capabilities are anticipated for future iterations but not included in the current scope:

### Autocomplete / Prefix Search
- Real-time word suggestions as user types
- Prefix-based index for sub-50ms suggestions
- Fuzzy matching for typo tolerance

### Multi-Language Support
- Lookup flow for non-English target languages
- Source/target language pairs (e.g., English→Vietnamese)
- Language-specific provider routing

### AI-Based Enrichment
- LLM-generated example sentences customized to user level
- Context-aware definitions based on learning materials
- Automated translation quality improvement

### Personalization
- Frequency-based result ordering (show meanings relevant to user's level)
- Learning history integration (highlight words user has seen before)
- Custom definition preferences (formal vs. casual)

---

## Assumptions

1. **External Provider Availability**: AzVocab, Oxford, and FreeDictionary APIs are accessible with reasonable SLAs. If providers change their APIs, adapter updates will be required.

2. **Caching Infrastructure**: A distributed cache (e.g., Redis) is available for the read model. If not, in-memory caching provides a degraded fallback.

3. **Event Infrastructure**: An event bus exists for publishing LookupMissedEvent. If unavailable, synchronous logging provides a degraded fallback for later batch processing.

4. **Read Replica Availability**: Database read replicas exist for optimized query performance. If not, primary database is used with potential performance impact.

5. **Word Language**: Initial scope is English-only. Multi-language support requires additional provider integrations.

---

## Dependencies

- **Existing Word Entity**: The Word aggregate and persistence layer from the Import flow
- **Event Bus**: Infrastructure for publishing and subscribing to domain events
- **Cache Layer**: Distributed cache for read model optimization
- **External Provider Credentials**: API keys and configuration for AzVocab, Oxford, FreeDictionary
