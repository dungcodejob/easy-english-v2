# Feature Quickstart Guide

> Template for getting up to speed on a feature quickly. Copy to `docs/features/quickstart.md`.

---

## What This Feature Does

_In one sentence. Example: "Quiz Mode presents vocabulary questions in multiple-choice format and tracks student performance."_

---

## Key Concepts

| Concept | Definition |
|---------|-----------|
| **Concept 1** | What it is and why it matters |
| **Concept 2** | What it is and why it matters |

---

## Key Files

### Server

| File | Purpose |
|------|---------|
| `modules/feature/domain/entities/` | Core domain logic |
| `modules/feature/application/commands/` | Write operations |
| `modules/feature/application/queries/` | Read operations |
| `modules/feature/presentation/controllers/` | HTTP endpoints |

### Client

| File | Purpose |
|------|---------|
| `modules/feature/pages/` | Route pages |
| `modules/feature/hooks/` | TanStack Query hooks |
| `modules/feature/services/` | API calls |
| `modules/feature/components/` | UI components |

---

## Data Flow

### Write Flow (User Action → Database)

```
User clicks "Submit"
        │
        ▼
POST /api/v1/feature/action
        │
        ▼
Controller receives DTO
        │
        ▼
Command dispatched to CommandBus
        │
        ▼
CommandHandler executes:
  1. Validates input
  2. Loads entity from repository
  3. Applies domain logic
  4. Persists changes
  5. Emits domain event
        │
        ▼
Response returned to client
```

### Read Flow (Page Load → UI)

```
Page mounts
        │
        ▼
TanStack Query hook fires
        │
        ▼
GET /api/v1/feature/resource
        │
        ▼
QueryHandler:
  1. Checks cache
  2. Queries repository
  3. Maps to DTO
        │
        ▼
Cache updated
        │
        ▼
Component re-renders with data
```

---

## Key Domain Rules

1. **Rule 1** — _Explanation_
2. **Rule 2** — _Explanation_

---

## Common Operations

### Adding a new X

1. Create `domain/entities/x.entity.ts`
2. Create `infrastructure/orm-entities/x.orm-entity.ts`
3. Create `domain/repositories/x.repository.ts` (interface)
4. Create `infrastructure/persistence/x.repository.ts` (impl)
5. Add to module's MikroORM forFeature
6. Add CQRS command/query and handler
7. Add controller endpoint
8. Add client hook and component

### Modifying existing behavior

1. Identify the domain entity that owns the logic
2. Check if it's in the domain layer (add method) or handler (add validation)
3. Update test to cover new behavior
4. Update this quickstart if behavior changes

---

## Debugging

### Server errors

```bash
# Enable debug logging
DEBUG=feature:* pnpm start:dev

# Check specific handler
grep -r "FeatureHandler" server/src/modules/feature/
```

### Client errors

```typescript
// Add query error inspection
const { error } = useFeatureQuery();
console.log(error);
```

### Network errors

- Check browser DevTools → Network tab
- Check Swagger at `/api/docs`
- Verify JWT is valid and not expired

---

## Related Documentation

- [Feature Spec](../specs/YYYY-MM-DD-feature-design.md)
- [Feature Plan](../plans/YYYY-MM-DD-feature-implementation.md)
- [Architecture Overview](../architecture/architecture-overview.md)
