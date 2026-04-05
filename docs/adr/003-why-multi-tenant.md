# ADR-003: Why Multi-tenant (Shared Database)

> Architecture Decision Record — Multi-tenancy isolation model.

## Status

**Accepted**

---

## Context

Easy English V2 serves individual learners and organizations (classrooms, teams). Each group needs:
- Isolated data (users can't see other workspaces' flashcards)
- Separate user rosters
- Independent learning settings
- Shared dictionary data (dictionary is read-only, not tenant-scoped)

We need to choose **how** to implement this isolation.

---

## Decision

We use a **shared database with application-level tenant isolation** (workspace-scoped rows):

- All tables have a `workspace_id` column
- Every repository query includes `workspace_id` in the filter
- A global `WorkspaceContextMiddleware` extracts `workspaceId` from the JWT
- The client can switch active workspace via `PATCH /auth/switch-workspace`

We deliberately chose **not** to use:
- Database-per-tenant (separate PostgreSQL instances per workspace)
- Schema-per-tenant (separate schemas in one database)
- PostgreSQL Row-Level Security (RLS)

---

## Consequences

### Positive

- **Simple migrations** — One schema to version, one set of migrations.
- **Cross-workspace queries possible** — Admin endpoints can query across workspaces for analytics.
- **Easier connection pooling** — One database connection pool, not one per tenant.
- **Shared dictionary data** — Dictionary lookups don't need tenant filtering, so caching is straightforward.

### Negative

- **Accidental data leakage risk** — Every developer must remember to include `workspaceId` in queries. A missed filter is a security bug.
- **No DB-level enforcement** — A bug in application code can expose data between tenants.
- **Shared index contention** — High-traffic tenants share the same database resources.

---

## Mitigation Strategies

### Code Enforcement

1. **Repository pattern** — All queries go through repositories. Repositories are the only place `workspaceId` is applied.
2. **Type-safe tenant context** — `ITenantContext` interface extracted from JWT. Passed explicitly to repository methods.
3. **MikroORM global filter** — A `@FilterDefinition` applied to all multi-tenant entities.

```typescript
// Every multi-tenant entity has this filter
@FilterDefinition({ name: 'tenant', cond: { workspaceId: '$_workspaceId' } })
@Entity({ tableName: 'flashcard' })
export class FlashcardOrmEntity { ... }
```

4. **Automated tests** — Integration tests verify tenant isolation by querying with wrong workspaceId.

### Naming Convention

All tenant-scoped tables include `workspace_id` in every query. The filter is applied at the repository level so it cannot be forgotten.

---

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Shared DB (chosen)** | Simple migrations, shared cache | Accidental leakage risk |
| PostgreSQL RLS | DB-enforced isolation | Performance overhead, complex policies |
| Schema-per-tenant | Logical isolation | Migration management nightmare |
| Database-per-tenant | Maximum isolation | Overkill for learning platform, complex ops |

---

## Tenant Context Flow

```
1. User logs in
2. JWT issued with { workspaceId: 'current-ws', workspaces: ['ws-1', 'ws-2'] }
3. Every request includes JWT
4. JwtAuthGuard validates token
5. WorkspaceContextMiddleware extracts workspaceId
6. AsyncLocalStorage stores tenant context
7. Repository queries use workspaceId filter automatically
8. If user switches workspace → new JWT issued with updated workspaceId
```

---

## Related Decisions

- [ADR-001: Why DDD](./001-why-ddd.md) — Tenant context is part of domain model
- [Multi-Tenant Design](../architecture/multi-tenant-design.md) — Full isolation implementation details
