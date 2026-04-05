# API Documentation

Reference documentation for all REST API endpoints.

## Contents

| Document | Description |
|----------|-------------|
| [authentication](./authentication.md) | Register, login, refresh, JWT structure |
| [workspace](./workspace.md) | Workspace CRUD, list, check |
| [flashcard](./flashcard.md) | Flashcard CRUD |
| [study](./study.md) | Due cards, study sessions, topics, reviews |

## Quick Navigation

```
API
├── authentication.md    ← Register, Login, Refresh
├── workspace.md       ← Workspace management
├── flashcard.md       ← Flashcard CRUD
└── study.md          ← Study sessions, reviews, topics
```

## Conventions

| Convention | Value |
|------------|-------|
| Base URL | `/api/v1` |
| Auth header | `Authorization: Bearer <jwt>` |
| Content-Type | `application/json` |
| Error format | `{ statusCode, message, error, details[] }` |
| Pagination | Query params `page`, `limit` |
| Timestamp format | ISO 8601 (`2026-04-05T00:00:00.000Z`) |
