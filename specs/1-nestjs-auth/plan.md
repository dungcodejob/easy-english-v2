# Implementation Plan: NestJS Authentication System

**Branch**: `1-nestjs-auth` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/1-nestjs-auth/spec.md`

---

## Summary

Implement a comprehensive authentication system for the NestJS backend supporting:
- **Local authentication** via email/username + password with auto-generated usernames
- **OAuth2 external providers** (Google, GitHub, Facebook) using `simple-oauth2` library
- **JWT-based token management** with access/refresh token pairs and HTTP-only cookies
- **Session management** with multi-device support and revocation capabilities

The architecture separates User identity from authentication methods via an Account entity, enabling users to have multiple login methods (LOCAL + OAuth providers).

**Reference**: Implementation patterns adapted from [NestJS OAuth2.0 Tutorial Series](https://dev.to/tugascript/series/21297)

---

## Technical Context

| Attribute | Value |
|-----------|-------|
| **Backend** | NestJS, CQRS (`@nestjs/cqrs`), MikroORM |
| **Database** | PostgreSQL |
| **Auth Libraries** | `@nestjs/jwt`, `@nestjs/passport`, `simple-oauth2`, `bcrypt` |
| **Cookie Handling** | `cookie-parser` (already configured per setup guide) |
| **API Style** | REST, versioned (`/api/v1/auth/...`), OpenAPI/Swagger documented |

---

## Constitution Compliance Checklist

> **GATE**: Must pass before Phase 0 research. Re-verify after Phase 1 design.

### Multi-Tenancy (§3)
- [x] All data access is scoped by tenant ID → User entity includes tenantId FK
- [x] Cross-tenant access is forbidden → User queries filter by tenantId
- [x] Tenant context is propagated through all layers → JWT includes tenantId claim

### Security (§4)
- [x] Authentication/Authorization is tenant-aware → Auth module establishes identity
- [x] Sensitive data is encrypted at rest and in transit → Passwords hashed with bcrypt, refresh tokens hashed
- [x] Least-privilege access is applied → JWT contains minimal claims (userId, tokenVersion)

### CQRS Rules (§5)
- [x] Commands mutate state only; return acknowledgment or ID only
- [x] Queries are read-only; no side effects
- [x] No mixing of Command and Query in a single handler

### API Design (§9)
- [x] API is versioned (`/api/v1/auth/...`)
- [x] DTOs are used; domain models are not exposed
- [x] Rate limiting is enforced on public endpoints → Auth endpoints rate-limited
- [x] Responses conform to the standard schema defined in response-schema.md
- [x] Endpoints adhere to the API contract specification

### Frontend State (§12)
- [x] N/A - Backend only for this specification

### Observability (§8)
- [x] Structured logging with tenant ID, user ID, correlation ID
- [x] Errors are traceable via correlation IDs

### Design for Extensibility & Maintainability (§18)
- [x] Favors design patterns promoting loose coupling (Strategy pattern for OAuth providers)
- [x] Avoids tight coupling between components

---

## Project Structure

### Specification Artifacts (this feature)

```text
specs/1-nestjs-auth/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Backend: `server/src/modules/auth/`

```text
server/src/modules/auth/
├── auth.module.ts                      # NestJS module definition
├── controllers/
│   ├── auth.controller.ts              # Local auth endpoints
│   ├── oauth.controller.ts             # OAuth2 provider endpoints
│   └── session.controller.ts           # Session management endpoints
├── application/
│   ├── commands/
│   │   ├── register.command.ts         # User registration
│   │   ├── login.command.ts            # Local login
│   │   ├── logout.command.ts           # Logout (session revocation)
│   │   ├── refresh-tokens.command.ts   # Token refresh with rotation
│   │   ├── oauth-callback.command.ts   # Handle OAuth callback
│   │   ├── link-account.command.ts     # Link OAuth to existing user
│   │   ├── unlink-account.command.ts   # Unlink OAuth account
│   │   ├── revoke-session.command.ts   # Revoke specific session
│   │   └── revoke-all-sessions.command.ts
│   └── queries/
│       ├── get-sessions.query.ts       # List user sessions
│       └── get-accounts.query.ts       # List linked accounts
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts              # Core identity (with tenantId FK)
│   │   ├── account.entity.ts           # Auth method (LOCAL/OAUTH)
│   │   └── session.entity.ts           # Login session
│   ├── value-objects/
│   │   ├── password.vo.ts              # Password hashing
│   │   └── token-version.vo.ts         # Token versioning
│   ├── enums/
│   │   ├── account-type.enum.ts        # LOCAL, GOOGLE, GITHUB, etc.
│   │   └── token-type.enum.ts          # ACCESS, REFRESH
│   └── repositories/
│       ├── user.repository.interface.ts
│       ├── account.repository.interface.ts
│       └── session.repository.interface.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── user.mikro-entity.ts
│   │   ├── account.mikro-entity.ts
│   │   └── session.mikro-entity.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── account.repository.ts
│   │   └── session.repository.ts
│   └── oauth/
│       ├── oauth.class.ts              # Base OAuth handler
│       ├── providers/
│       │   ├── google.provider.ts
│       │   ├── github.provider.ts
│       │   └── facebook.provider.ts
│       └── oauth.config.ts             # Provider configurations
├── guards/
│   ├── jwt-auth.guard.ts               # JWT validation
│   └── local-auth.guard.ts             # Local strategy guard
├── strategies/
│   ├── jwt.strategy.ts                 # Passport JWT strategy
│   └── local.strategy.ts               # Passport local strategy
├── decorators/
│   ├── current-user.decorator.ts       # Extract user from request
│   └── public.decorator.ts             # Mark public endpoints
└── dto/
    ├── requests/
    │   ├── register.dto.ts
    │   ├── login.dto.ts
    │   ├── oauth-callback.dto.ts
    │   └── revoke-session.dto.ts
    └── responses/
        ├── auth-tokens.dto.ts
        ├── user-profile.dto.ts
        ├── session.dto.ts
        └── account.dto.ts
```

### Backend: `server/src/core/` (System Infrastructure)

```text
server/src/core/
├── jwt/                  # JWT module (shared across auth contexts)
│   ├── jwt.module.ts
│   ├── jwt.service.ts
│   └── interfaces/
│       ├── token-payload.interface.ts
│       └── token-response.interface.ts
└── security/
    └── password.service.ts  # Bcrypt hashing service
```

---

## Backend Design

### Commands (State Mutations)

| Command | Handler | Description |
|---------|---------|-------------|
| `RegisterCommand` | `RegisterHandler` | Create User + LOCAL Account, issue tokens |
| `LoginCommand` | `LoginHandler` | Validate credentials, create Session, issue tokens |
| `LogoutCommand` | `LogoutHandler` | Revoke current Session, clear cookies |
| `RefreshTokensCommand` | `RefreshTokensHandler` | Validate refresh token, rotate, issue new pair |
| `OAuthCallbackCommand` | `OAuthCallbackHandler` | Exchange code, find/create User, issue tokens |
| `LinkAccountCommand` | `LinkAccountHandler` | Add OAuth Account to existing User |
| `UnlinkAccountCommand` | `UnlinkAccountHandler` | Remove Account (if not last) |
| `RevokeSessionCommand` | `RevokeSessionHandler` | Invalidate specific Session |
| `RevokeAllSessionsCommand` | `RevokeAllSessionsHandler` | Invalidate all Sessions for User |

### Queries (Read Operations)

| Query | Handler | Description |
|-------|---------|-------------|
| `GetSessionsQuery` | `GetSessionsHandler` | List all active Sessions for User |
| `GetAccountsQuery` | `GetAccountsHandler` | List all linked Accounts for User |

### API Endpoints

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| `POST` | `/api/v1/auth/register` | `RegisterCommand` | Register with email/password |
| `POST` | `/api/v1/auth/login` | `LoginCommand` | Login with email/username + password |
| `POST` | `/api/v1/auth/logout` | `LogoutCommand` | Logout current session |
| `POST` | `/api/v1/auth/refresh` | `RefreshTokensCommand` | Refresh access token |
| `GET` | `/api/v1/auth/oauth/:provider` | - | Redirect to OAuth provider |
| `GET` | `/api/v1/auth/oauth/:provider/callback` | `OAuthCallbackCommand` | OAuth callback handler |
| `POST` | `/api/v1/auth/accounts/link/:provider` | `LinkAccountCommand` | Link OAuth account |
| `DELETE` | `/api/v1/auth/accounts/:accountId` | `UnlinkAccountCommand` | Unlink account |
| `GET` | `/api/v1/auth/accounts` | `GetAccountsQuery` | List linked accounts |
| `GET` | `/api/v1/auth/sessions` | `GetSessionsQuery` | List active sessions |
| `DELETE` | `/api/v1/auth/sessions/:sessionId` | `RevokeSessionCommand` | Revoke specific session |
| `DELETE` | `/api/v1/auth/sessions` | `RevokeAllSessionsCommand` | Revoke all sessions |

---

## Frontend Design

> **N/A** - This specification covers backend API only.

---

## Verification Plan

### Automated Verification
- [ ] All unit tests pass (domain entities, services)
- [ ] All integration tests pass (API endpoints, auth flows)
- [ ] Lint and type checks pass
- [ ] API contracts match OpenAPI spec

### Manual Verification
- [ ] Register with valid credentials → tokens issued
- [ ] Login with email OR username → works
- [ ] OAuth flow (Google) → redirects correctly, tokens issued
- [ ] Refresh token rotation → old token invalidated
- [ ] Session list shows all devices → correct
- [ ] Session revocation → immediately effective

---

## Core/Shared Usage Justification

### Backend Core/Shared

| Location | Code Added/Modified | Justification | Why Not in Feature Module? |
|----------|---------------------|---------------|----------------------------|
| `server/src/core/jwt/` | JWT service for token generation/validation | JWT handling is system-level infrastructure | May be used by other auth-related features (API keys, etc.) |
| `server/src/core/security/password.service.ts` | Bcrypt password hashing | Security utility is cross-cutting | No domain ownership, stateless utility |

---

## Complexity Tracking

> No violations. All patterns comply with Constitution.

---

## Open Questions

- [x] Password requirements? → Minimum 8 chars + 1 number + 1 special character
- [x] Concurrent refresh token handling? → Detect as theft, revoke all sessions
- [x] Email conflict on OAuth? → Auto-merge to existing User
- [x] Session retention? → Soft-delete, 30 days audit trail
- [x] OAuth provider failure? → Show error, suggest alternative

---

## Dependencies to Install

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local simple-oauth2 bcrypt
npm install -D @types/passport-jwt @types/passport-local @types/simple-oauth2 @types/bcrypt
```

---

## References

- [NestJS OAuth2.0 Tutorial Series](https://dev.to/tugascript/series/21297) - Primary implementation reference
- [simple-oauth2 Documentation](https://github.com/lelylan/simple-oauth2)
- [NestJS Authentication Guide](https://docs.nestjs.com/security/authentication)
