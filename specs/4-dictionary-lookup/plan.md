# Implementation Plan: Dictionary Lookup Flow

**Branch**: `4-dictionary-lookup` | **Date**: 2026-02-10 | **Spec**: [spec.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/4-dictionary-lookup/spec.md)  
**Input**: Technical specification for read-optimized, side-effect-free Dictionary Lookup flow

---

## Summary

Implement a **read-only Dictionary Lookup flow** with 3-layer caching (Memory → DB → Provider Cache → AzVocab API). This is a **pure query operation**—no direct database writes during request cycle. External provider responses are cached asynchronously.

**Phase 1 Scope (from Clarifications):**
- ✅ JWT authentication required (no anonymous access)
- ✅ No rate limiting (rely on external provider quotas)
- ✅ AzVocab only (Oxford, FreeDictionary deferred)
- ✅ Exact word lookup only (prefix search deferred)
- ✅ No request deduplication (caching sufficient)

---

## Technical Context

| Attribute | Value |
|-----------|-------|
| **Frontend** | React 18, TanStack Router, TanStack Query, Zustand, Shadcn UI |
| **Backend** | NestJS, CQRS (`@nestjs/cqrs`), MikroORM |
| **Database** | PostgreSQL |
| **Testing** | Jest (backend), Vitest / React Testing Library (frontend) |
| **API Style** | REST, versioned (`/api/v1/...`), OpenAPI/Swagger documented |
| **External API** | AzVocab (Phase 1 only) |

---

## Constitution Compliance Checklist

> **GATE**: Must pass before proceeding.

### Multi-Tenancy (§3)
- [x] All data access is scoped by tenant ID → Word lookup uses `tenantId` from JWT
- [x] Cross-tenant access is forbidden → Repository queries include tenant filter
- [x] Tenant context is propagated through all layers → Via `RequestContextService`

### Security (§4)
- [x] Authentication/Authorization is tenant-aware → JWT required (FR-012)
- [x] Sensitive data is encrypted at rest and in transit → Standard PostgreSQL + HTTPS
- [x] Least-privilege access is applied → Read-only repository for lookup

### CQRS Rules (§5)
- [x] Commands mutate state only → No commands in lookup flow
- [x] Queries are read-only → `LookupWordHandler` is `@QueryHandler`
- [x] No mixing of Command and Query → Lookup separate from Import

### API Design (§9)
- [x] API is versioned (`/api/v1/...`) → `/api/v1/dictionary/lookup/:word`
- [x] DTOs are used; domain models not exposed → `WordSnapshotResponseDto`
- [x] Rate limiting is enforced → N/A per clarification (deferred)
- [x] Responses conform to standard schema → Using `ApiResponse` wrapper

### Frontend State (§12)
- [x] Server state uses TanStack Query only → `useLookupWord()` hook
- [x] Client/UI state uses Zustand only → Search history, recent lookups
- [x] No backend business rules duplicated → All validation on backend

### Observability (§8)
- [x] Structured logging with tenant ID, user ID, correlation ID → Via `RequestContextService`
- [x] Errors are traceable via correlation IDs → Standard NestJS setup

### Design for Extensibility & Maintainability (§17)
- [x] Favors design patterns promoting loose coupling → Decorator pattern for caching
- [x] Avoids tight coupling → Provider interface abstraction

---

## Backend Design

### Queries (Read Operations)

| Query | Handler | Description |
|-------|---------|-------------|
| `LookupWordQuery` | `LookupWordHandler` | Lookup word by text, return `WordSnapshot` |

### API Endpoints

| Method | Endpoint | Handler | Auth | Description |
|--------|----------|---------|------|-------------|
| `GET` | `/api/v1/dictionary/lookup/:word` | `LookupWordQuery` | JWT | Lookup word definition |

### Domain Events

| Event | Handler | Trigger |
|-------|---------|---------|
| `LookupMissedEvent` | `LookupMissedHandler` | Word not found in DB, triggers async enrichment |
| `LookupSucceededEvent` | `LookupSucceededHandler` | Successful lookup (analytics/metrics) |

### New Entities

| Entity | Purpose |
|--------|---------|
| `ProviderResponseCacheEntity` | Store raw API responses from AzVocab |

---

## Frontend Design

### State Management

| Store/Hook | Type | Purpose |
|------------|------|---------|
| `useLookupWord(word)` | TanStack Query | Server state: fetch word definition |
| `useLookupStore` | Zustand | UI state: search history, recent words |

### Components

| Component | Shadcn Base | Purpose |
|-----------|-------------|---------|
| `WordLookupInput` | `Input` | Search input with debounce |
| `WordDefinitionCard` | `Card` | Display word snapshot result |
| `PronunciationPlayer` | `Button` | Play audio pronunciation |

---

## Proposed Changes

### Backend: `server/src/modules/dictionary/`

---

#### [NEW] `dictionary.module.ts`

NestJS module registering all providers, handlers, and repositories.

---

#### [NEW] `controllers/lookup.controller.ts`

REST endpoint: `GET /api/v1/dictionary/lookup/:word`
- Requires JWT authentication
- Validate input (word length 1-100, allowed characters)
- Dispatch `LookupWordQuery`
- Return `WordSnapshotResponseDto`

---

#### [NEW] `application/queries/lookup-word.query.ts`

```typescript
export class LookupWordQuery {
  constructor(
    public readonly word: string,
    public readonly tenantId: string,
    public readonly userId: string,
  ) {}
}
```

---

#### [NEW] `application/queries/lookup-word.handler.ts`

`@QueryHandler(LookupWordQuery)` - Main lookup orchestration:
1. Normalize word (lowercase, trim)
2. Check memory cache (CacheManager)
3. Query `WordReadRepository`
4. If miss → Query `CachingProviderDecorator` (AzVocab)
5. If miss → Emit `LookupMissedEvent`
6. Return `WordSnapshot` or throw `NotFoundException`

---

#### [NEW] `domain/value-objects/word-snapshot.vo.ts`

Immutable read model:
- `text`, `normalizedText`, `language`
- `pronunciations[]`, `senses[]`
- `source: 'internal' | 'azvocab'`

---

#### [NEW] `domain/events/lookup-missed.event.ts`

```typescript
export class LookupMissedEvent extends DomainEvent {
  constructor(props: {
    word: string;
    tenantId: string;
    userId: string;
  }) { ... }
}
```

---

#### [NEW] `domain/repositories/word-read.repository.interface.ts`

```typescript
export interface IWordReadRepository {
  findByWord(normalizedWord: string, tenantId: string): Promise<WordSnapshot | null>;
}
```

---

#### [NEW] `domain/providers/lookup-provider.interface.ts`

```typescript
export interface ILookupProvider {
  readonly name: string;
  lookup(word: string): Promise<WordSnapshot | null>;
  isAvailable(): Promise<boolean>;
}
```

---

#### [NEW] `infrastructure/persistence/provider-response-cache.orm-entity.ts`

MikroORM entity for caching raw provider responses:
- `normalizedWord`, `provider`, `rawResponse` (JSON)
- `httpStatus`, `createdAt`, `expiresAt`
- Unique index on `[normalizedWord, provider]`

---

#### [NEW] `infrastructure/repositories/word-read.repository.ts`

Implements `IWordReadRepository`:
- Query `WordOrmEntity` with eager load
- Map to `WordSnapshot` via `WordSnapshotMapper`

---

#### [NEW] `infrastructure/providers/caching-provider.decorator.ts`

Decorator pattern wrapping `ILookupProvider`:
1. Check `ProviderResponseCache` for cached response
2. If hit → Map to `WordSnapshot`
3. If miss → Call wrapped provider, async save to cache

---

#### [NEW] `infrastructure/providers/azvocab/azvocab.lookup-provider.ts`

Pure HTTP client:
- No DB access, no side effects
- Maps AzVocab DTO → `WordSnapshot`

---

#### [MODIFY] `infrastructure/providers/azvocab/azvocab.http-client.ts`

Add **definition-level caching** to `getDefinitionById(defId)`:
- Inject `IProviderCacheRepository`
- Before HTTP call: check cache with `findByWord(defId, 'azvocab-definition')`
- On cache HIT (not expired): return cached `rawResponse` as DTO
- On cache MISS + successful HTTP: fire-and-forget save with TTL 30 days
- On cache MISS + HTTP failure: return null (partial data acceptable)
- Provider key: `azvocab-definition` (distinct from word-level `azvocab`)
- Cache key: `defId` stored in existing `normalizedWord` column (no migration needed)

---

#### [NEW] `dto/responses/word-snapshot.response.dto.ts`

Response DTO for API output.

---

## Verification Plan

### Automated Tests

| Test Type | Location | Command |
|-----------|----------|---------|
| Unit: Handler | `server/src/modules/dictionary/application/queries/__tests__/lookup-word.handler.spec.ts` | `pnpm --filter server test lookup-word.handler` |
| Unit: Repository | `server/src/modules/dictionary/infrastructure/repositories/__tests__/word-read.repository.spec.ts` | `pnpm --filter server test word-read.repository` |
| Unit: CachingDecorator | `server/src/modules/dictionary/infrastructure/providers/__tests__/caching-provider.decorator.spec.ts` | `pnpm --filter server test caching-provider` |

### Manual Verification

1. **Start server**: `pnpm --filter server dev`
2. **Lookup existing word**: 
   ```bash
   curl -H "Authorization: Bearer <JWT>" http://localhost:3000/api/v1/dictionary/lookup/hello
   ```
   - Verify response contains definition, pronunciations, examples
3. **Lookup missing word (triggers AzVocab)**:
   ```bash
   curl -H "Authorization: Bearer <JWT>" http://localhost:3000/api/v1/dictionary/lookup/supercalifragilistic
   ```
   - Verify response from external provider
   - Check `provider_response_cache` table for new word-level entry
4. **Verify definition-level cache**:
   ```sql
   SELECT normalized_word, provider, http_status, expires_at
   FROM provider_response_cache
   WHERE provider = 'azvocab-definition';
   ```
   - Verify individual definition records exist with `provider = 'azvocab-definition'`
   - Verify `normalized_word` contains defId UUIDs
   - Verify `expires_at` is ~30 days from now
5. **Verify partial recovery**:
   - Lookup a word, note its definition defIds
   - Delete the word-level cache entry (`provider = 'azvocab'`)
   - Lookup the same word again
   - Verify definition cache hits (no HTTP calls for those definitions)
6. **Verify auth required**:
   ```bash
   curl http://localhost:3000/api/v1/dictionary/lookup/hello
   ```
   - Verify 401 Unauthorized response

---

## Core/Shared Usage Justification

**N/A** - All code resides in feature module (`modules/dictionary/`). Uses existing base classes from `core/ddd/` (AggregateRoot, ValueObject, DomainEvent) without modification.

---

## Open Questions

- [x] Authentication required? → Yes (FR-012)
- [x] Rate limiting strategy? → None for Phase 1
- [x] Request deduplication? → Deferred to Phase 2
- [x] Prefix search? → Deferred to Phase 2
- [x] External providers? → AzVocab only for Phase 1
