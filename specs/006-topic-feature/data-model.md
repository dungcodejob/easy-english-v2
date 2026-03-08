# Phase 1: Data Model

## Entities

### `Topic`
Represents a user-created vocabulary list. It acts as an Aggregate Root within the Learning bounded context.

**Fields**:
- `id` (uuid, primary key)
- `tenantId` (uuid, foreign key, index)
- `userId` (uuid, index)
- `name` (string, max 100 chars)
- `description` (string, nullable, max 500 chars)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Relationships**:
- One-to-Many with `TopicWord`

**Constraints & Rules**:
- A user can have a maximum of 50 topics (enforced via domain service or command handler).
- `name` cannot be empty.

---

### `TopicWord`
Represents the association between a `Topic` and a `WordSense`.

**Fields**:
- `id` (uuid, primary key)
- `topicId` (uuid, foreign key to `Topic`, index)
- `wordSenseId` (uuid, reference to Dictionary module `WordSense` ID)
- `status` (enum: `NEW`, `LEARNING`, `MASTERED`) - *Note: This maps to the learning status.*
- `addedAt` (timestamp)

**Relationships**:
- Many-to-One with `Topic`

**Constraints & Rules**:
- UNIQUE constraint on `(topicId, wordSenseId)` to prevent duplicates within a single topic.
- A topic can have a maximum of 200 words (enforced via domain entity `Topic.addWord()`).
- Added words default to `status = NEW`.
- Deleting a `Topic` must cascade delete its associated `TopicWord` records.
