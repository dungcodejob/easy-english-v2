# Research: WordSense Learning Feature

**Date**: 2026-03-06  
**Branch**: `005-wordsense-learning`

---

## R1: Cross-domain reference — How does Learning reference Dictionary?

**Decision**: Learning module references `WordSenseOrmEntity.id` (UUID) as a foreign key in `UserWordSenseProgress`.

**Rationale**: The `word_senses` table already has a UUID primary key (`gen_random_uuid()`). The Learning module can safely reference this ID without coupling to the Dictionary domain's internal aggregate structure. This is a standard cross-bounded-context integration pattern using shared IDs.

**Alternatives considered**:
- Domain events to sync data → Over-engineering for a simple FK reference
- Shared kernel with a common WordSenseId type → Adds coupling between modules unnecessarily

---

## R2: New module or extend existing?

**Decision**: Create a new `learning` module (`server/src/modules/learning/`).

**Rationale**: The Learning domain is a separate bounded context from Dictionary. Per constitution §2 (DDD bounded contexts) and the project's module structure pattern (auth, dictionary, workspace), Learning should be its own module with its own aggregate, repositories, handlers, and controller.

**Alternatives considered**:
- Add to dictionary module → Violates bounded context separation; dictionary is read-only
- Add to workspace module → Learning is not workspace-specific (per clarification: globally scoped)

---

## R3: Idempotent "Add to Learning" — DB-level or application-level?

**Decision**: Both. Application-level check first (query existing), with DB-level unique constraint as safety net.

**Rationale**: A `UNIQUE(user_id, word_sense_id)` constraint on `user_word_sense_progress` combined with a partial index `WHERE archived_at IS NULL` handles the soft-delete case. The application checks first to provide a clean "already learning" response, while the DB constraint prevents race conditions.

**Alternatives considered**:
- Application-only check → Race condition window between check and insert
- DB-only (upsert) → Less informative response; harder to distinguish "created" vs "already existed"

---

## R4: Soft delete for "Remove from Learning"

**Decision**: Use an `archivedAt` timestamp column (nullable). When set, the record is "removed." Re-adding clears the timestamp and restores.

**Rationale**: This preserves historical progress data (mastery level, review count) while hiding it from the active list. The column doubles as a boolean flag (`IS NULL` = active, `IS NOT NULL` = archived) without needing a separate `status` enum.

**Alternatives considered**:
- Boolean `isArchived` flag → Less informative than a timestamp (no "when was it removed?" data)
- Status enum (active/archived/deleted) → Over-engineering; only two states needed now

---

## R5: Search implementation — full-text search or LIKE?

**Decision**: Use `ILIKE` prefix matching on `words.normalized_text` for MVP. Index: `CREATE INDEX idx_words_normalized_text_pattern ON words (normalized_text varchar_pattern_ops)`.

**Rationale**: The spec requires prefix-based matching (FR-002). For an MVP with a dictionary of ~50k-100k words, `ILIKE 'book%'` with a `varchar_pattern_ops` index is fast enough (<100ms). Full-text search with `tsvector` can be added later if needed.

**Alternatives considered**:
- PostgreSQL full-text search (`tsvector`) → More complex setup, not needed for prefix matching
- Elasticsearch → External dependency, over-engineering for vocabulary search
- trigram index (`pg_trgm`) → Better for fuzzy matching but not required by spec

---

## R6: Search returns WordSenses, not Words

**Decision**: The search API returns a flat list of WordSenses (each with parent word text) rather than a nested Word → Senses structure.

**Rationale**: The spec's primary entity is WordSense (FR-004: "display each search result with: word text, part of speech, short definition, CEFR level"). Users search for senses, not words. A flat list is simpler to paginate and display.

**Alternatives considered**:
- Nested Word → Senses → More complex pagination (20 senses vs 20 words), harder to rank individual senses

---

## R7: Multi-tenancy for Learning

**Decision**: Dictionary data is global (no tenant scoping on words). `UserWordSenseProgress` is user-scoped (userId from JWT), not tenant-scoped.

**Rationale**: Per spec assumptions: "Learning progress is per-user globally (not scoped to a workspace or topic in this feature)." Dictionary words are shared knowledge — they don't belong to a tenant. User progress is personal. The existing `words` and `word_senses` tables have no tenant column.

**Note**: If multi-tenant learning isolation is needed in the future, a `tenantId` column can be added to `user_word_sense_progress` with a migration.
