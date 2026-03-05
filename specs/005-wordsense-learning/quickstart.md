# Quickstart: WordSense Learning Feature

**Branch**: `005-wordsense-learning`

---

## Prerequisites

- Node.js 18+ / npm
- PostgreSQL running with `easy_english` database
- Server running: `cd server && npm run start:debug`
- Client running: `cd client && npm run dev`

---

## New Module Setup

### 1. Create the Learning module structure

```bash
# Create module directories
mkdir -p server/src/modules/learning/{controllers,application/{commands,queries},domain/{entities,repositories,value-objects},infrastructure/{persistence,repositories},dto/{requests,responses}}
```

### 2. Create MikroORM migration

```bash
cd server
npx mikro-orm migration:create --name=create-user-word-sense-progress
```

### 3. Register the module

Add `LearningModule` to `AppModule` imports in `server/src/app.module.ts`.

---

## Key Files to Create

| File | Purpose |
|------|---------|
| `learning.module.ts` | NestJS module definition |
| `learning.controller.ts` | REST endpoints |
| `user-word-sense-progress.orm-entity.ts` | MikroORM entity |
| `add-to-learning.command.ts` | CQRS command |
| `add-to-learning.handler.ts` | Command handler |
| `remove-from-learning.command.ts` | CQRS command |
| `remove-from-learning.handler.ts` | Command handler |
| `get-learning-list.query.ts` | CQRS query |
| `get-learning-list.handler.ts` | Query handler |

### Dictionary module additions

| File | Purpose |
|------|---------|
| `search-word-senses.query.ts` | New CQRS query for search |
| `search-word-senses.handler.ts` | Query handler with ILIKE search |
| `get-word-sense-detail.query.ts` | New CQRS query for sense details |
| `get-word-sense-detail.handler.ts` | Query handler |
| `dictionary.controller.ts` (updated) | Add search + detail endpoints |

---

## Verification

```bash
# Run server
cd server && npm run start:debug

# Test search (public)
curl http://localhost:3001/api/v1/dictionary/search?q=book

# Test add to learning (authenticated)
curl -X POST http://localhost:3001/api/v1/learning/senses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"wordSenseId":"<uuid>"}'

# Test learning list (authenticated)
curl http://localhost:3001/api/v1/learning/senses \
  -H "Authorization: Bearer <token>"
```
