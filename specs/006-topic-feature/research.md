# Phase 0: Outline & Research

## Technical Context Evaluation

Based on the [feature specification](../spec.md) and the system constitution, the technical context is fully established:
- **Backend**: NestJS, `@nestjs/cqrs`, MikroORM, PostgreSQL
- **Frontend**: API contracts (OpenAPI)
- **Domain**: Learning module, referencing `WordSense` from the Dictionary module.

There are **no NEEDS CLARIFICATION markers** remaining in the specification.

## Decisions

### Topic and TopicWord Association
- **Decision**: Use a separate entity `TopicWord` to handle the many-to-many relationship instead of a simple array or primitive collection.
- **Rationale**: The association between a `Topic` and a `WordSense` carries its own state (`status`: NEW, LEARNING, MASTERED) and metadata (`addedAt`). A dedicated entity is required to model this correctly in MikroORM and DDD.
- **Alternatives considered**: Native array of strings (rejected because it cannot store the learning status per word in the topic).

### Pagination Approach
- **Decision**: Implement Offset pagination (page/limit) for listing topics, and Cursor or Offset pagination for listing topic words, using standard DTO responses.
- **Rationale**: Easy to implement with `@nestjs/cqrs` and MikroORM. Follows common API patterns.

All technical foundations are clear. Proceeding to Phase 1: Data Model and API Contracts.
