# Multi-Tenant Design

> Tenant isolation strategy, data model, and context propagation for **Easy English V2**.

---

## 1. Overview

Easy English V2 uses a **workspace-centric multi-tenancy** model. Each tenant (workspace) is an isolated environment containing its own users, learning data, flashcards, and study sessions. The isolation is enforced at the application layer with `workspaceId` as a mandatory query-scoped parameter.

---

## 2. Tenancy Model

### Key Design Decision: Shared Database, Isolated Schemas

```
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                      │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Workspace A │  │ Workspace B │  │ Workspace C │         │
│  │  Namespace  │  │  Namespace  │  │  Namespace  │         │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤         │
│  │ Users       │  │ Users       │  │ Users       │         │
│  │ Workspaces  │  │ Workspaces  │  │ Workspaces  │         │
│  │ Flashcards  │  │ Flashcards  │  │ Flashcards  │         │
│  │ Progress    │  │ Progress    │  │ Progress    │         │
│  │ Topics      │  │ Topics      │  │ Topics      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  All tables have: workspace_id (NOT NULL, indexed)          │
└─────────────────────────────────────────────────────────────┘
```

### Why Not Row-Level Security (RLS)?

| Approach | Pros | Cons |
|----------|------|------|
| **Application-level (chosen)** | Full control, easy debugging, no DB overhead | Accidental data leaks possible |
| **PostgreSQL RLS** | DB-enforced, tamper-proof | Performance overhead, complex policies |
| **Schema-per-tenant** | Complete isolation | Migration nightmare, connection pooling issues |
| **Database-per-tenant** | Maximum isolation | Overkill for a learning platform |

Application-level isolation with `workspaceId` was chosen for:
- Simpler migrations and schema evolution
- Easy cross-workspace analytics (admin only)
- Lower infrastructure complexity

---

## 3. Data Model

### Core Multi-Tenant Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                        user                                      │
├─────────────────────────────────────────────────────────────────┤
│ id               uuid     PK                                    │
│ email            text     UNIQUE, NOT NULL                      │
│ password_hash    text     NOT NULL                              │
│ display_name     text     NOT NULL                              │
│ avatar_url       text     NULLABLE                              │
│ native_language  text     DEFAULT 'en'                          │
│ created_at       timestamp                                                  │
│ updated_at       timestamp                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     user_workspace                               │
├─────────────────────────────────────────────────────────────────┤
│ id               uuid     PK                                    │
│ user_id          uuid     FK → user.id, NOT NULL                │
│ workspace_id     uuid     FK → workspace.id, NOT NULL            │
│ role             text     CHECK (role IN ('owner', 'admin', 'member'))
│ created_at       timestamp                                                  │
│ UNIQUE(user_id, workspace_id)                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ N:1
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        workspace                                 │
├─────────────────────────────────────────────────────────────────┤
│ id               uuid     PK                                    │
│ name             text     NOT NULL                              │
│ slug             text     UNIQUE, NOT NULL                      │
│ type             text     DEFAULT 'personal'                    │
│ native_language  text     DEFAULT 'en'                          │
│ learning_languages jsonb   DEFAULT ['en']                        │
│ learning_level   text     CHECK (learning_level IN (...))       │
│ learning_goal    text     CHECK (learning_goal IN (...))         │
│ daily_new_cards  integer  DEFAULT 20                            │
│ daily_review_cards integer DEFAULT 100                          │
│ timezone         text     DEFAULT 'UTC'                          │
│ created_at       timestamp                                                  │
│ updated_at       timestamp                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     flashcard (multi-tenant)                    │
├─────────────────────────────────────────────────────────────────┤
│ id               uuid     PK                                    │
│ workspace_id     uuid     FK → workspace.id, NOT NULL           │
│ front            text     NOT NULL                              │
│ back             text     NOT NULL                              │
│ notes            text     NULLABLE                              │
│ media_urls       jsonb    DEFAULT []                             │
│ word_sense_id    uuid     FK → dictionary.word_sense.id          │
│ created_at       timestamp                                                  │
│ updated_at       timestamp                                                  │
│ INDEX: idx_flashcard_workspace_id (workspace_id)                │
│ INDEX: idx_flashcard_word_sense_id (word_sense_id)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   card_progress (multi-tenant)                  │
├─────────────────────────────────────────────────────────────────┤
│ id               uuid     PK                                    │
│ workspace_id     uuid     FK → workspace.id, NOT NULL           │
│ flashcard_id     uuid     FK → flashcard.id, NOT NULL           │
│ state            text     DEFAULT 'new'                         │
│ due_date         timestamp                                                  │
│ stability        float    DEFAULT 0.0                            │
│ difficulty       float    DEFAULT 0.0                            │
│ reviews          integer  DEFAULT 0                             │
│ lapses           integer  DEFAULT 0                             │
│ created_at       timestamp                                                  │
│ updated_at       timestamp                                                  │
│ INDEX: idx_card_progress_workspace_id (workspace_id)            │
│ INDEX: idx_card_progress_due_date (due_date) WHERE state != 'reviewed'
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Workspace Isolation

### Enforcement Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    JWT Token Payload                         │
│  { sub: userId, workspaceId: "ws-uuid", workspaces: [...] } │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              WorkspaceContextMiddleware                       │
│  - Extract workspaceId from JWT                              │
│  - Validate workspaceId is in user's workspaces[]            │
│  - Attach to AsyncLocalStorage (no thread-local in Node)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Repository Layer                            │
│  - All queries automatically scoped by workspaceId           │
│  - MikroORM filters enforce tenant isolation                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Query                            │
│  WHERE workspace_id = $1  (parameterized, always present)    │
└─────────────────────────────────────────────────────────────┘
```

### MikroORM Tenant Filter

All multi-tenant repositories apply a global filter:

```typescript
// Base repository with tenant scope
@Injectable()
export abstract class TenantAwareRepository<T> {
  async findAll(filter: Partial<T>): Promise<T[]> {
    return this.ormRepository.find({
      ...filter,
      workspaceId: this.getCurrentWorkspaceId(), // Always enforced
    });
  }
}
```

### Workspace Switch

Users with access to multiple workspaces can switch between them:

```
┌────────┐  PATCH /api/v1/auth/switch-workspace
│ Client │ ─────────────────────────────────────
└────────┘
           body: { workspaceId: "new-ws-uuid" }
                    │
                    ▼
         Validate user has access to workspace
                    │
                    ▼
         Generate new JWT with updated workspaceId claim
                    │
                    ▼
         Return { accessToken, refreshToken }
                    │
                    ▼
         Client updates local token
         (no page reload required)
```

---

## 5. Workspace Context Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User                                     │
│  email: alice@example.com                                        │
│  workspaces: [ws-personal, ws-classroom, ws-work]              │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ Active session (one workspace at a time)
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  JWT Token State                                │
│                                                                  │
│  Current: ws-classroom                                           │
│  All workspaces: [ws-personal, ws-classroom, ws-work]           │
└─────────────────────────────────────────────────────────────────┘
           │
           │ workspaceId in every request
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Request → Response Cycle                            │
│                                                                  │
│  GET /api/v1/topics        → Returns only ws-classroom topics   │
│  POST /api/v1/topics       → Creates in ws-classroom only       │
│  GET /api/v1/workspaces     → Returns all 3 workspaces           │
│  PATCH /auth/switch        → Switches active workspaceId        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Multi-Tenant Data Isolation Checklist

Every repository query **MUST** include `workspaceId`:

| Operation | Enforced? |
|-----------|-----------|
| `SELECT * FROM flashcard` | ❌ Must add `WHERE workspace_id = ?` |
| `INSERT INTO card_progress` | ❌ Must include `workspace_id` |
| `UPDATE topic` | ❌ Must include `workspace_id` in WHERE |
| `DELETE FROM user_workspace` | ❌ Cascade check required |

---

## 7. Cross-Workspace Operations

Some operations require accessing data across workspaces:

| Operation | Scope | Access Control |
|-----------|-------|---------------|
| List user's workspaces | Global | Own workspaces only |
| Invite user to workspace | Target workspace | `owner` or `admin` role |
| Export workspace data | Single workspace | `owner` role |
| Delete workspace | Single workspace | `owner` role only |

---

## 8. Workspace Types

| Type | Purpose | Limits |
|------|---------|--------|
| `personal` | Individual learning | 5,000 cards, 500 topics |
| `classroom` | Group learning | 10,000 cards, 2,000 topics |
| `institutional` | Enterprise/organization | Unlimited (configurable) |

---

## 9. Related Documentation

- [Architecture Overview](./architecture-overview.md) — System map
- [System Design](./system-design.md) — Infrastructure details
- [API Documentation](../api/) — Endpoint references with tenant scope
