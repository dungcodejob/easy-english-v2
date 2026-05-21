# System Design

> Infrastructure design, deployment model, and data flow for **Easy English V2**.

---

## 1. Overview

Easy English V2 is a **multi-tenant SaaS** deployed as a **monolithic backend** serving a **single-page application (SPA)** frontend. The architecture prioritizes developer velocity and maintainability over extreme horizontal scalability — appropriate for a product in active development.

---

## 2. Deployment Model

```
                    ┌─────────────────────────┐
                    │      Load Balancer       │
                    │    (nginx / cloud LB)     │
                    └──────────┬──────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                                 │
              ▼                                 ▼
  ┌───────────────────────┐       ┌───────────────────────┐
  │   React SPA (Static)   │       │   NestJS API Server  │
  │   Rsbuild / CDN       │       │   Node.js + PM2/Docker│
  │   Port: 4200 (dev)     │       │   Port: 3000 (prod)   │
  └───────────────────────┘       └───────────┬────────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │                               │
                              ▼                               ▼
                    ┌─────────────────────┐     ┌─────────────────────┐
                    │     PostgreSQL       │     │      Redis           │
                    │   (primary DB)       │     │  (session cache /    │
                    │   Port: 5432          │     │   rate limiting)     │
                    └─────────────────────┘     └─────────────────────┘
```

### Environment Tiers

| Environment | Purpose | Deployment |
|-------------|---------|-----------|
| **Development** | Local dev | `npm run start:dev` (server) + `npm run dev` (client) |
| **Staging** | Pre-production testing | Pull request preview |
| **Production** | Live users | Docker / cloud deployment |

---

## 3. API Layer Design

### REST Convention

All API endpoints follow: `/api/v1/<resource>/<action>`

| Pattern | Example | Handler |
|---------|---------|---------|
| `GET /resource` | `GET /api/v1/workspaces` | Query handler |
| `GET /resource/:id` | `GET /api/v1/topics/123` | Query handler |
| `POST /resource` | `POST /api/v1/flashcards` | Command handler |
| `PATCH /resource/:id` | `PATCH /api/v1/progress/456` | Command handler |
| `DELETE /resource/:id` | `DELETE /api/v1/topics/789` | Command handler |

### Global Middleware Stack

```
Request
  │
  ▼
Rate Limiter (Redis-backed)
  │
  ▼
Body Parser (JSON limit: 10MB)
  │
  ▼
Helmet (security headers)
  │
  ▼
CORS (configured origins)
  │
  ▼
JwtAuthGuard (validates token, extracts workspaceId)
  │
  ▼
Controller
  │
  ▼
Exception Filter (standardized error response)
  │
  ▼
Response
```

### Standard API Response

All responses follow a consistent envelope with `success`, `correlationId`, and `timestamp` fields:

```typescript
// Success
{
  "success": true,
  "data": T,               // payload
  "meta": { ... },         // optional metadata
  "pagination": {          // optional pagination
    "top": 10,
    "count": 25,
    "hasMore": true,
    "skip": 0,
    "nextLink": "/api/users?skip=10&top=10"
  },
  "correlationId": "uuid",
  "timestamp": "2026-04-12T10:30:00.000Z"
}

// Error
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "type": "domain",
    "message": "Email already registered",
    "details": [
      {
        "field": "email",
        "message": "This email is already in use",
        "code": "UNIQUE_VIOLATION"
      }
    ]
  },
  "correlationId": "uuid",
  "timestamp": "2026-04-12T10:30:00.000Z"
}
```

---

## 4. Database Design

### ORM Strategy — MikroORM

MikroORM was chosen for its:
- **Type-safe query builder** with full TypeScript support
- **Entity metadata** driven by decorators (no separate mapping files)
- **Migration system** with versioned SQL scripts
- **Unit of Work** pattern for automatic change tracking
- **Soft deletes** support via `@Index` decorators

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Table | snake_case, plural | `user_workspaces` |
| Column | snake_case | `created_at` |
| Foreign Key | `<table>_id` | `workspace_id` |
| Index | `idx_<table>_<column>` | `idx_user_workspaces_user_id` |
| Entity file | `*.orm-entity.ts` | `user.orm-entity.ts` |
| Domain entity | `*.entity.ts` | `user.entity.ts` |

### Migrations

```
server/src/migrations/
├── Version20240101000000.ts    # Initial schema
├── Version20240115000000.ts    # Add flashcard table
└── Version20240320000000.ts    # Add learning progress
```

Run migrations:
```bash
npm run migration:up          # Apply pending
npm run migration:down        # Rollback last
npm run migration:fresh       # Drop + recreate (dev only)
npm run migration:create       # Generate new migration
```

---

## 5. Authentication & Authorization

### JWT Strategy

```
┌────────┐   POST /api/v1/auth/login   ┌──────────┐
│ Client │ ────────────────────────────│   Auth   │
└────────┘                             │  Module  │
       │                                └────┬─────┘
       │  { accessToken, refreshToken }       │
       │◄────────────────────────────────────┘
       │
       │ Every request:
       │ Authorization: Bearer <accessToken>
       ▼
  JwtAuthGuard
  ├── Verify signature (RS256 with PEM key pair)
  ├── Check expiry
  └── Extract payload:
        {
          sub: userId,
          workspaceId: currentWorkspaceId,
          workspaces: [workspaceIds],
          role: "owner" | "member"
        }
```

### Token Lifecycle

| Token | TTL | Storage | Purpose |
|-------|-----|---------|---------|
| Access Token | 7 days | localStorage (via Zustand persist) | API authorization |
| Refresh Token | 30 days | HttpOnly cookie | Renew access token |

### Workspace Context

Every authenticated request carries `workspaceId` from the JWT. The `WorkspaceContextMiddleware` extracts and validates this, ensuring all queries are tenant-scoped.

---

## 6. Caching Strategy

```
┌─────────────────────────────────────────────────────┐
│                   Request                            │
└─────────────────────┬───────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │ Is result cacheable?   │
         │ (GET + no auth params) │
         └────────────┬────────────┘
                      │
          ┌───────────┴───────────┐
          │  Cache hit? (Redis)   │
          └───────────┬───────────┘
                      │
        ┌─────────────┴─────────────┐
        │      Yes      │    No     │
        │◄─────────────┼───────────►│
        │              ▼            │
        │    Execute query          │
        │              │            │
        │              ▼            │
        │    Store in Redis         │
        │    (TTL: 5 min)           │
        │              │            │
        ▼              ▼            ▼
   Return cached  Return result
```

Caching is applied selectively:
- **Dictionary word lookups** (read-heavy, infrequent updates) — cache TTL 1 hour
- **Workspace metadata** — cache TTL 15 minutes
- **User preferences** — cache TTL 30 minutes
- **Learning progress** — never cached (real-time accuracy required)

---

## 7. Data Flow Diagrams

### User Registration Flow

```
┌────────┐  POST /auth/register   ┌─────────────────┐
│ Client │ ──────────────────────│   Auth Module    │
└────────┘                       └────────┬────────┘
                                          │
                         ┌────────────────┴────────────────┐
                         │                                    │
                         ▼                                    ▼
              Create User Entity                  Create UserWorkspace
              (hashed password)                    (owner role)
                         │                                    │
                         └────────────────┬───────────────────┘
                                          │
                                          ▼
                              Create Default Workspace
                              (learning_level: intermediate)
                                          │
                                          ▼
                              Emit UserRegisteredEvent
                                          │
                         ┌────────────────┴────────────────┐
                         ▼                                 ▼
              Generate JWT tokens              Send welcome email (async)
                         │                                 │
                         ▼                                 ▼
              Return to client                 Event handler (background)
```

### Spaced Repetition Review Flow

```
┌────────┐  POST /study/reviews    ┌────────────────────┐
│ Client │ ──────────────────────│  ReviewCommandHandler│
└────────┘                        └─────────┬────────────┘
                                            │
                         ┌──────────────────┼──────────────────┐
                         ▼                  ▼                  ▼
              Load CardProgress     Load Flashcard       Load UserSettings
              (stability, diff,    (front, back,       (max cards/day)
               state, due_date)      media_urls)
                         │                  │                  │
                         └──────────────────┴──────────────────┘
                                            │
                                            ▼
                              Apply FSRS Algorithm
                              (calculate next interval)
                                            │
                         ┌──────────────────┴──────────────────┐
                         ▼                                      ▼
              Update CardProgress                    Update ReviewLog
              (due_date, stability,                 (rating, latency,
               difficulty, state)                    response_time)
                         │                                      │
                         ▼                                      ▼
                  Emit CardReviewedEvent            Emit SessionStatsUpdated
                         │                                      │
                         └──────────────────┬───────────────────┘
                                            │
                                            ▼
                              Return updated progress
                              (next_due_date, new_state)
```

---

## 8. Error Handling Strategy

All errors flow through a **global exception filter** that normalizes them into a standard response format:

```typescript
// Error categories and HTTP status mapping
| Error Type               | HTTP Status | Response Shape               |
|--------------------------|-------------|-------------------------------|
| ValidationError          | 400         | { message, details[] }       |
| UnauthorizedException    | 401         | { message }                   |
| ForbiddenException       | 403         | { message }                   |
| NotFoundException        | 404         | { message }                   |
| ConflictException        | 409         | { message, conflictId }       |
| DomainRuleViolation      | 422         | { message, rule, context }    |
| InternalServerError      | 500         | { message, traceId }          |
```

Domain errors use `Result<T, E>` from `neverthrow` for explicit error propagation, ensuring errors are handled at the appropriate boundary rather than leaking upward.

---

## 9. Security Model

| Concern | Implementation |
|---------|------------|
| SQL Injection | MikroORM parameterized queries (no raw SQL) |
| XSS | React's built-in escaping + CSP headers |
| CSRF | HttpOnly cookie tokens + SameSite=Strict |
| Rate Limiting | Redis-backed, 100 req/min per IP |
| Password Storage | Argon2 (primary) with bcrypt fallback |
| Secrets | Environment variables (never committed) |
| Input Validation | class-validator on all DTOs |
| Tenant Isolation | workspaceId enforced at query level |

---

## 10. Related Documentation

- [Architecture Overview](./architecture-overview.md) — High-level system map
- [Multi-Tenant Design](./multi-tenant-design.md) — Tenant isolation details
- [CQRS Guidelines](./cqrs-guidelines.md) — Command/query separation
