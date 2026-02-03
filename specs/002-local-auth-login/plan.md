# Implementation Plan: Local Authentication Login Flow

**Branch**: `002-local-auth-login` | **Date**: 2026-02-04 | **Spec**: [spec.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/spec.md)  
**Input**: Feature specification from `/specs/002-local-auth-login/spec.md`

**Note**: This plan implements a Domain-Driven Design (DDD) authentication flow with strict CQRS separation, following constitution §5.

---

## Summary

Implement a secure, tenant-aware Local Authentication (email/password) login flow that validates user credentials, creates authenticated sessions with JWT tokens, and emits comprehensive audit events. The implementation strictly separates domain logic (password verification, session creation) from infrastructure concerns (token generation, HTTP handling) and provides extensibility for future authentication providers (OAuth, SSO).

**Key Technical Approach**:
- Domain layer enforces business rules (password verification via AuthIdentity aggregate, session limits via Session aggregate)
- Application layer coordinates login workflow via `LoginCommand` and session queries
- Infrastructure layer handles token generation (JWT), rate limiting, and persistence
- Failed login attempts tracked for security monitoring (LoginAttemptTracker entity)
- All responses prevent account enumeration attacks

---

## Technical Context

| Attribute | Value |
|-----------|-------|
| **Frontend** | React 18, TanStack Router, TanStack Query, Zustand, Shadcn UI |
| **Backend** | NestJS, CQRS (`@nestjs/cqrs`), MikroORM |
| **Database** | PostgreSQL |
| **Testing** | Jest (backend), Vitest / React Testing Library (frontend) |
| **API Style** | REST, versioned (`/api/v1/...`), OpenAPI/Swagger documented |

---

## Constitution Compliance Checklist

> **GATE**: Must pass before Phase 0 research. Re-verify after Phase 1 design.

### Multi-Tenancy (§3)
- [x] All data access is scoped by tenant ID (User, AuthIdentity, Session all include tenantId)
- [x] Cross-tenant access is forbidden (enforced at repository layer via tenant context)
- [x] Tenant context is propagated through all layers (via RequestContext)

### Security (§4)
- [x] Authentication/Authorization is tenant-aware (Session includes tenantId)
- [x] Sensitive data is encrypted at rest and in transit (passwords hashed with bcrypt/argon2, TLS for transit)
- [x] Least-privilege access is applied (only authenticated users can create sessions)

### CQRS Rules (§5)
- [x] Commands mutate state only; return acknowledgment or ID only (LoginCommand returns session ID + tokens)
- [x] Queries are read-only; no side effects (GetSessionQuery, ValidateSessionQuery)
- [x] No mixing of Command and Query in a single handler (strict separation)

### API Design (§9)
- [x] API is versioned (`/api/v1/auth/login`)
- [x] DTOs are used; domain models are not exposed (LoginRequestDto, LoginResponseDto)
- [x] Rate limiting is enforced on public endpoints (login endpoint protected against brute-force)
- [x] Responses conform to the standard schema defined in response-schema.md
- [x] Endpoints adhere to the API contract specification

### Frontend State (§12)
- [x] Server state uses TanStack Query only (useLogin mutation hook)
- [x] Client/UI state uses Zustand only (N/A - login is purely server-side)
- [x] No backend business rules duplicated on frontend (password validation only on backend)

### Observability (§8)
- [x] Structured logging with tenant ID, user ID, correlation ID (all login attempts logged)
- [x] Errors are traceable via correlation IDs (LoginFailed events include correlationId)

### Design for Extensibility & Maintainability (§18)
- [x] Favors design patterns promoting loose coupling (Strategy pattern for AuthProvider extensibility)
- [x] Avoids tight coupling between components (domain independent of infrastructure)

---

## Project Structure

### Specification Artifacts (this feature)

```text
specs/002-local-auth-login/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Backend: `server/src/modules/auth/`

```text
server/src/modules/auth/
├── auth.module.ts                       # NestJS module definition
├── controllers/
│   └── auth.controller.ts               # Login endpoint (/api/v1/auth/login)
├── application/
│   ├── commands/
│   │   ├── login.command.ts             # LoginCommand definition
│   │   └── login.handler.ts             # LoginCommandHandler (coordinates login flow)
│   └── queries/
│       ├── get-session.query.ts         # GetSessionQuery (fetch session by ID)
│       ├── get-session.handler.ts       # GetSessionQueryHandler
│       ├── validate-session.query.ts    # ValidateSessionQuery (check session validity)
│       └── validate-session.handler.ts  # ValidateSessionQueryHandler
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts               # User aggregate (EXISTING - may need updates)
│   │   ├── auth-identity.entity.ts      # AuthIdentity aggregate (password verification)
│   │   ├── session.entity.ts            # Session aggregate (session lifecycle)
│   │   └── login-attempt-tracker.entity.ts  # LoginAttemptTracker (failed attempt tracking)
│   ├── value-objects/
│   │   └── email.vo.ts                  # Email value object (normalization)
│   ├── events/
│   │   ├── login-succeeded.event.ts     # LoginSucceeded domain event
│   │   ├── login-failed.event.ts        # LoginFailed domain event
│   │   └── session-created.event.ts     # SessionCreated domain event
│   └── repositories/
│       ├── user.repository.interface.ts
│       ├── auth-identity.repository.interface.ts
│       ├── session.repository.interface.ts
│       └── login-attempt-tracker.repository.interface.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── auth-identity.orm-entity.ts  # MikroORM entity for AuthIdentity
│   │   ├── session.orm-entity.ts        # MikroORM entity for Session
│   │   └── login-attempt-tracker.orm-entity.ts  # MikroORM entity for LoginAttemptTracker
│   ├── repositories/
│   │   ├── user.repository.ts           # UserRepository implementation
│   │   ├── auth-identity.repository.ts  # AuthIdentityRepository implementation
│   │   ├── session.repository.ts        # SessionRepository implementation
│   │   └── login-attempt-tracker.repository.ts  # LoginAttemptTrackerRepository implementation
│   └── services/
│       ├── token-generator.service.ts   # JWT token generation (infrastructure concern)
│       └── password-hasher.service.ts   # Password hashing service (bcrypt/argon2)
└── dto/
    ├── requests/
    │   └── login.request.dto.ts         # LoginRequestDto (email, password)
    └── responses/
        └── login.response.dto.ts        # LoginResponseDto (accessToken, refreshToken, expiresAt)
```

**Backend Constraints**:
- Business logic MUST reside in domain entities (AuthIdentity.verifyPassword, Session.create)
- Controllers are thin: validate input, delegate to LoginCommandHandler, return DTOs
- LoginCommand ONLY returns session ID and tokens (no user data exposed)
- All data access MUST be tenant-scoped (enforced at repository layer)

---

## Backend Design

### Commands (State Mutations)

| Command | Handler | Description |
|---------|---------|-------------|
| `LoginCommand` | `LoginCommandHandler` | Authenticates user credentials, creates new session, returns tokens |
| `LogoutCommand` | `LogoutCommandHandler` | Revokes active session (future scope) |
| `RefreshTokenCommand` | `RefreshTokenCommandHandler` | Refreshes access token using refresh token (future scope) |

### Queries (Read Operations)

| Query | Handler | Description |
|-------|---------|-------------|
| `GetSessionQuery` | `GetSessionQueryHandler` | Retrieves session by ID (for validation) |
| `ValidateSessionQuery` | `ValidateSessionQueryHandler` | Validates session token and returns session state |
| `GetUserSessionsQuery` | `GetUserSessionsQueryHandler` | Lists all active sessions for a user (future scope) |

### API Endpoints

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| `POST` | `/api/v1/auth/login` | `LoginCommand` | Authenticate with email/password, create session |
| `POST` | `/api/v1/auth/logout` | `LogoutCommand` | Revoke current session (future scope) |
| `POST` | `/api/v1/auth/refresh` | `RefreshTokenCommand` | Refresh access token (future scope) |
| `GET` | `/api/v1/auth/sessions` | `GetUserSessionsQuery` | List user's active sessions (future scope) |

---

## Frontend Design

### Pages & Routes

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/login` | `LoginPage` | Login form with email/password inputs |
| `/` (protected) | `DashboardPage` | Redirects to login if not authenticated |

### State Management

| Store/Hook | Type | Purpose |
|------------|------|------------|
| `useLogin` | TanStack Query Mutation | Server state: POST /api/v1/auth/login |
| `useAuthStore` | Zustand | UI state: current user, auth tokens (localStorage persistence) |
| `useSession` | TanStack Query | Server state: GET /api/v1/auth/session (validate current session) |

### Components

| Component | Shadcn Base | Purpose |
|-----------|-------------|---------|
| `LoginForm` | `Card, Input, Button` | Email/password form with validation |
| `AuthProvider` | Context Provider | Wraps app, provides auth state globally |
| `ProtectedRoute` | N/A | Route guard that redirects to login if unauthenticated |

---

## Testing Strategy

### Backend Tests

| Type | Location | Scope |
|------|----------|-------|
| Unit | `server/src/modules/auth/domain/**/*.spec.ts` | Domain logic (AuthIdentity.verifyPassword, Session.create) |
| Unit | `server/src/modules/auth/application/**/*.spec.ts` | Command/Query handlers (LoginCommandHandler) |
| Integration | `server/test/auth/login.e2e-spec.ts` | Full login flow: POST /api/v1/auth/login |
| Integration | `server/test/auth/session-limits.e2e-spec.ts` | Session limit enforcement (6th session revokes oldest) |
| Integration | `server/test/auth/failed-attempts.e2e-spec.ts` | Failed login tracking and rate limiting |

**Test Coverage Requirements**:
- All business rules (BR-001 through BR-009) must have corresponding unit tests
- All error scenarios (ERR-001 through ERR-004) must have integration tests
- All edge cases documented in spec must have tests

### Frontend Tests

| Type | Location | Scope |
|------|----------|-------|
| Unit | `client/src/modules/auth/**/*.test.tsx` | Components (LoginForm), hooks (useLogin) |
| Integration | `client/src/modules/auth/hooks/use-login.test.ts` | Login mutation hook with mock API |
| E2E | `client/e2e/auth/login.spec.ts` | Full login flow: form input → API call → redirect |

---

## Verification Plan

### Automated Verification

#### Backend Tests
```bash
# Run all auth module unit tests
cd server
npm run test -- --testPathPattern=src/modules/auth

# Run integration tests
npm run test:e2e -- --testPathPattern=test/auth

# Verify all tests pass
npm run test:cov -- --testPathPattern=auth
```

#### Frontend Tests
```bash
# Run auth module unit tests
cd client
npm run test -- src/modules/auth

# Run E2E tests
npm run test:e2e -- e2e/auth/login.spec.ts
```

#### Lint & Type Checks
```bash
# Backend
cd server
npm run lint
npm run typecheck

# Frontend
cd client
npm run lint
npm run typecheck
```

### Manual Verification

**Test Scenario 1: Successful Login**
1. Navigate to `http://localhost:3000/login`
2. Enter valid credentials: `test@example.com` / `password123`
3. Click "Login" button
4. **Expected**: Redirect to dashboard, session stored in localStorage
5. **Expected**: Network tab shows `POST /api/v1/auth/login` with 200 status
6. **Expected**: Response contains `accessToken`, `refreshToken`, `expiresAt`

**Test Scenario 2: Invalid Credentials**
1. Navigate to `http://localhost:3000/login`
2. Enter invalid credentials: `test@example.com` / `wrongpassword`
3. Click "Login" button
4. **Expected**: Error message "Invalid email or password" (generic, no enumeration)
5. **Expected**: Network tab shows `POST /api/v1/auth/login` with 401 status
6. **Expected**: No session created

**Test Scenario 3: Non-Existent User**
1. Navigate to `http://localhost:3000/login`
2. Enter non-existent email: `nonexistent@example.com` / `password123`
3. Click "Login" button
4. **Expected**: Same error message as invalid credentials (prevents enumeration)
5. **Expected**: Network tab shows `POST /api/v1/auth/login` with 401 status

**Test Scenario 4: Blocked Account**
1. Block a test user account in the database
2. Navigate to `http://localhost:3000/login`
3. Enter blocked user credentials
4. Click "Login" button
5. **Expected**: Error message "Account is blocked. Please contact support."
6. **Expected**: Network tab shows `POST /api/v1/auth/login` with 403 status

**Test Scenario 5: Session Limit Enforcement**
1. Log in the same user from 5 different browsers/incognito windows
2. Verify all 5 sessions are active (check `GET /api/v1/auth/sessions`)
3. Log in from a 6th browser
4. **Expected**: 6th login succeeds, oldest session is automatically revoked
5. **Expected**: Attempt to use oldest session token fails with 401 Unauthorized

---

## Core/Shared Usage Justification

### Backend Core/Shared

| Location | Code Added/Modified | Justification | Why Not in Feature Module? |
|----------|---------------------|---------------|----------------------------|
| `server/src/core/domain/aggregate-root.ts` | None (existing) | Uses existing AggregateRoot base class | System-level base class for all aggregates |
| `server/src/core/domain/entity.ts` | None (existing) | Uses existing Entity base class | System-level base class for all entities |
| `server/src/core/domain/value-object.ts` | None (existing) | Uses existing ValueObject base class | System-level base class for all value objects |
| `server/src/shared/decorators/tenant-aware.decorator.ts` | None (existing) | Uses existing @TenantAware decorator | Cross-cutting tenant isolation mechanism |

### Frontend Shared

| Location | Code Added/Modified | Justification | Why Not in Feature Module? |
|----------|---------------------|---------------|----------------------------|
| `client/src/shared/api/axios-instance.ts` | Add auth interceptor for token injection | Cross-cutting concern: all API requests need auth headers | Used by all feature modules for API calls |
| `client/src/shared/contexts/auth-context.tsx` | Create AuthProvider context | Cross-cutting: auth state accessed globally across modules | Provides authentication state to entire app |

---

## Complexity Tracking

> **No violations** - All implementation follows constitution guidelines without exceptions.

---

## Open Questions

- [ ] Which password hashing algorithm to use: bcrypt or argon2? (Research required)
- [ ] Should refresh tokens be rotated on each use (one-time-use) or reusable? (Spec says one-time-use, confirm implementation approach)
- [ ] How should cleanup of expired sessions be handled? (Background job? Separate feature?)
- [ ] Should we implement "remember me" functionality (extended refresh token lifetime)? (Out of scope, clarify with user)

---

**Next Steps**: 
1. Generate `research.md` to resolve open questions (Phase 0)
2. Generate `data-model.md` with entity schemas (Phase 1)
3. Generate API contracts in `contracts/` directory (Phase 1)
4. Create `quickstart.md` with setup instructions (Phase 1)
5. Run `/speckit.tasks` to generate implementation tasks (Phase 2)
