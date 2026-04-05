# Learning Architecture Refactor — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify FSRS state on `UserWordSenseProgress`, move `FsrsSchedulerService` to `learning/progress`, support multiple learning modes (Flashcard + Dictionary), drop `TopicWord.status` (derive from FSRS state).

**Architecture:**
- `FsrsParameters`, `CardState`, `ReviewRating` VOs + `FsrsSchedulerService` move from `flashcard` → `learning/progress/domain/`
- `UserWordSenseProgress` gains `_fsrsParams`, `applyReview()`, and 4 new domain events
- `ReviewCardHandler` updates `UserWordSenseProgress.applyReview()` (not `Flashcard.review()`) for dictionary-linked cards; custom cards skip progress update
- `ReviewWordHandler` (new) — dictionary-mode review endpoint
- `ReviewLog` extended with nullable `wordSenseId` for non-card reviews
- `TopicWord.status` dropped from DB, derived at read time from `UserWordSenseProgress.fsrsParams`

**Tech Stack:** NestJS, MikroORM, PostgreSQL, neverthrow, @nestjs/cqrs

---

## File Inventory

### New files (create)

| File | Purpose |
|---|---|
| `server/src/modules/learning/progress/domain/value-objects/fsrs-parameters.vo.ts` | Copy from flashcard VO |
| `server/src/modules/learning/progress/domain/value-objects/card-state.vo.ts` | Copy from flashcard VO |
| `server/src/modules/learning/progress/domain/value-objects/review-rating.vo.ts` | Copy from flashcard VO |
| `server/src/modules/learning/progress/domain/services/fsrs-scheduler.service.ts` | Copy from flashcard service |
| `server/src/modules/learning/progress/domain/events/word-learning-started.event.ts` | New |
| `server/src/modules/learning/progress/domain/events/word-learning-removed.event.ts` | New |
| `server/src/modules/learning/progress/domain/events/word-reviewed.event.ts` | New |
| `server/src/modules/learning/progress/domain/events/word-mastered.event.ts` | New |
| `server/src/modules/learning/progress/domain/events/index.ts` | Barrel export |
| `server/src/modules/learning/progress/application/commands/review-word.command.ts` | New |
| `server/src/modules/learning/progress/application/commands/review-word.handler.ts` | New |
| `server/migrations/YYYYMMDDHHMMSS-add-fsrs-to-progress.sql` | Phase 1 SQL |
| `server/migrations/YYYYMMDDHHMMSS-add-word-sense-id-to-review-log.sql` | ReviewLog extension |

### Modify files

| File | Changes |
|---|---|
| `server/src/modules/learning/progress/domain/entities/user-word-sense-progress.entity.ts` | Add `_fsrsParams`, `applyReview()`, new getters, emit events |
| `server/src/modules/learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity.ts` | Add FSRS columns; keep legacy columns for transition |
| `server/src/modules/learning/progress/infrastructure/mappers/user-word-sense-progress.mapper.ts` | Map `_fsrsParams`; derive legacy fields in `toResponse()` |
| `server/src/modules/learning/progress/infrastructure/repositories/learning-write.repository.ts` | Map `_fsrsParams` to ORM; remove `em.transactional()` |
| `server/src/modules/learning/progress/progress.module.ts` | Export `FsrsSchedulerService`; add new handlers |
| `server/src/modules/flashcard/domain/entities/flashcard.aggregate.ts` | Remove `_schedulingState`, `review()`; keep `wordSenseId` |
| `server/src/modules/flashcard/domain/value-objects/fsrs-parameters.vo.ts` | Delete |
| `server/src/modules/flashcard/domain/value-objects/card-state.vo.ts` | Delete |
| `server/src/modules/flashcard/domain/value-objects/review-rating.vo.ts` | Delete |
| `server/src/modules/flashcard/domain/services/fsrs-scheduler.service.ts` | Delete |
| `server/src/modules/flashcard/infrastructure/mappers/flashcard.mapper.ts` | Remove scheduling state mapping |
| `server/src/modules/flashcard/infrastructure/persistence/flashcard.orm-entity.ts` | Drop scheduling state relation |
| `server/src/modules/flashcard/infrastructure/persistence/flashcard-scheduling-state.orm-entity.ts` | Delete |
| `server/src/modules/flashcard/application/commands/review-card/review-card.handler.ts` | Refactor to call `UserWordSenseProgress.applyReview()` |
| `server/src/modules/flashcard/application/events/update-study-stats.handler.ts` | Swap decorator to `WordReviewedEvent` |
| `server/src/modules/flashcard/flashcard.module.ts` | Import `FsrsSchedulerService` from `ProgressModule`; drop local service + scheduling entities |
| `server/src/modules/flashcard/domain/entities/review-log.entity.ts` | Add `_wordSenseId` |
| `server/src/modules/flashcard/infrastructure/persistence/review-log.orm-entity.ts` | Add nullable `wordSenseId` column |
| `server/src/modules/flashcard/infrastructure/mappers/review-log.mapper.ts` | Handle both card-based and word-based entries |
| `server/src/modules/learning/topic/domain/entities/topic-word.entity.ts` | Remove `updateStatus()` |
| `server/src/modules/learning/topic/infrastructure/persistence/topic-word.orm-entity.ts` | Drop `status` column |
| `server/src/modules/learning/topic/infrastructure/mappers/topic.mapper.ts` | `toResponse(topic, progressMap)` derives status |
| `server/src/modules/learning/topic/application/queries/list-topic-words.handler.ts` | Fetch progress records; build `progressMap` |
| `server/src/modules/learning/topic/application/commands/add-topic-word.handler.ts` | Remove `topicWord.status.value` from response |

---

## Chunk 1: Migration — Add FSRS columns to `user_word_sense_progress`
## Chunk 2: Migration — Add `word_sense_id` to `review_logs`
## Chunk 3: Progress VO — Add `FsrsParameters`, `CardState`, `ReviewRating`
## Chunk 4: Progress — Add `FsrsSchedulerService`
## Chunk 5: Progress — Add 4 domain events + barrel export
## Chunk 6: Progress domain — Refactor `UserWordSenseProgress`
## Chunk 7: Progress ORM — Add FSRS columns to `UserWordSenseProgressOrmEntity`
## Chunk 8: Progress mapper — Update `UserWordSenseProgressMapper`
## Chunk 9: Progress repository — Update `LearningWriteRepository`
## Chunk 10: Progress — Add `ReviewWordCommand` + `ReviewWordHandler`
## Chunk 11: Progress module — Export service, add handlers
## Chunk 12: Flashcard — Remove FSRS from `Flashcard` aggregate
## Chunk 13: Flashcard — Remove scheduling state entities
## Chunk 14: Flashcard mapper — Remove scheduling state
## Chunk 15: Flashcard — Refactor `ReviewCardHandler`
## Chunk 16: Flashcard — Update `UpdateStudyStatsHandler` event decorator
## Chunk 17: Flashcard module — Import `FsrsSchedulerService` from `ProgressModule`
## Chunk 18: Topic domain — Remove `TopicWord.updateStatus()`
## Chunk 19: Topic ORM — Drop `status` column from `TopicWordOrmEntity`
## Chunk 20: Topic mapper — `toResponse(topic, progressMap)` derives status
## Chunk 21: Topic handler — Update `ListTopicWordsHandler`
## Chunk 22: Topic handler — Update `AddTopicWordHandler`
## Chunk 23: ReviewLog — Add `wordSenseId` to entity + ORM + mapper
## Chunk 24: Build + lint verification
