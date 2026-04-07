# Domain Documentation

Reference-style documentation for each DDD module — entities, value objects, domain events, and repository interfaces, extracted from actual codebase entities.

## Modules

| Module | Bounded Context | Description |
|--------|---------------|-------------|
| [auth](./auth/) | Authentication & Identity | Users, sessions, JWT tokens |
| [workspace](./workspace/) | Multi-tenancy | Workspace management |
| [dictionary](./dictionary/) | Vocabulary | Word lookup, search, CEFR levels, provider enrichment |
| [flashcard](./flashcard/) | Learning | Card-level flashcard management |
| [learning](./learning/) | Learning | Progress tracking, study sessions, topics |

## Conventions Used

| Symbol | Meaning |
|--------|---------|
| `uuid` | Primary key (v7 UUID) |
| `FK` | Foreign key relationship |
| `NOT NULL` | Required field |
| `nullable` | Optional field |
| `AggregateRoot` | Entity that emits domain events |
| `Entity` | Domain entity without event emission |
| `ValueObject` | Immutable value type |
