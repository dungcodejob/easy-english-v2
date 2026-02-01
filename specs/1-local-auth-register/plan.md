# Implementation Plan: Local Auth Register with Tenant Creation

**Branch**: `1-local-auth-register` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-local-auth-register/spec.md`

---

## Summary

Implement user registration with LOCAL authentication (email + password) that automatically creates a Tenant for the registering user. The user becomes ADMIN of the new tenant. Registration does NOT auto-login; user must authenticate separately after successful registration.

**Key Technical Decisions**:
- Password hashing: bcrypt with cost factor 12
- Username: Auto-generated from email prefix with random suffix
- Response: Success message + userId, email, tenantId (no tokens)
- Atomic transaction: User + Tenant + AuthIdentity created together

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
- [x] All data access is scoped by tenant ID → User and Tenant created together; tenant context established at registration
- [x] Cross-tenant access is forbidden → N/A for registration (creates new tenant)
- [x] Tenant context is propagated through all layers → Tenant ID included in response

### Security (§4)
- [x] Authentication/Authorization is tenant-aware → N/A (public endpoint for registration)
- [x] Sensitive data is encrypted at rest and in transit → Password hashed with bcrypt; HTTPS required
- [x] Least-privilege access is applied → New user gets ADMIN role for their own tenant only

### CQRS Rules (§5)
- [x] Commands mutate state only; return acknowledgment or ID only → Returns userId, email, tenantId
- [x] Queries are read-only; no side effects → N/A (registration is command-only)
- [x] No mixing of Command and Query in a single handler → Single RegisterCommand

### API Design (§9)
- [x] API is versioned (`/api/v1/...`) → `POST /api/v1/auth/register`
- [x] DTOs are used; domain models are not exposed → RegisterRequestDto, RegisterResponseDto
- [x] Rate limiting is enforced on public endpoints → Deferred to infrastructure (documented in assumptions)
- [x] Responses conform to the standard schema → Uses response envelope

### Frontend State (§12)
- [x] Server state uses TanStack Query only → Registration mutation via TanStack Query
- [x] Client/UI state uses Zustand only → Form state managed locally
- [x] No backend business rules duplicated on frontend → Validation rules from API, not duplicated

### Observability (§8)
- [x] Structured logging with tenant ID, user ID, correlation ID → Log registration attempts per FR-012
- [x] Errors are traceable via correlation IDs → Standard error response includes correlationId

### Design for Extensibility & Maintainability (§18)
- [x] Favors design patterns promoting loose coupling → CQRS pattern, repository abstraction
- [x] Avoids tight coupling between components → AuthIdentity separate from User entity

---

## Project Structure

### Specification Artifacts (this feature)

```text
specs/1-local-auth-register/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Research findings
├── data-model.md        # Phase 1: Entity definitions
├── contracts/           # Phase 1: API contracts (OpenAPI)
│   └── register.yaml    # Register endpoint contract
├── quickstart.md        # Phase 1: Setup instructions
└── tasks.md             # Phase 2: Implementation tasks
```

### Backend: `server/src/modules/auth/`

```text
server/src/modules/auth/
├── auth.module.ts                      # NestJS module definition
├── controllers/
│   └── auth.controller.ts              # HTTP endpoints (register, login, etc.)
├── application/
│   ├── commands/
│   │   ├── register.command.ts         # Command definition
│   │   └── register.handler.ts         # Command handler
│   └── queries/                        # (Future: login verification)
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts              # User aggregate
│   │   ├── tenant.entity.ts            # Tenant aggregate
│   │   ├── auth-identity.entity.ts     # AuthIdentity entity
│   │   └── session.entity.ts           # Session entity (future)
│   ├── value-objects/
│   │   ├── email.vo.ts                 # Email value object
│   │   ├── password.vo.ts              # Password value object (handles hashing)
│   │   └── username.vo.ts              # Username value object
│   ├── services/
│   │   └── username-generator.service.ts # Username generation logic
│   └── repositories/
│       ├── user.repository.interface.ts
│       ├── tenant.repository.interface.ts
│       └── auth-identity.repository.interface.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── user.orm-entity.ts          # MikroORM entity
│   │   ├── tenant.orm-entity.ts        # MikroORM entity
│   │   └── auth-identity.orm-entity.ts # MikroORM entity
│   └── repositories/
│       ├── user.repository.ts          # Repository implementation
│       ├── tenant.repository.ts        # Repository implementation
│       └── auth-identity.repository.ts # Repository implementation
└── dto/
    ├── requests/
    │   └── register.request.dto.ts     # Registration request DTO
    └── responses/
        └── register.response.dto.ts    # Registration response DTO
```

### Frontend: `client/src/modules/auth/`

```text
client/src/modules/auth/
├── index.ts                            # Public module exports
├── components/
│   ├── register-form.tsx               # Registration form component
│   └── password-input.tsx              # Password input with visibility toggle
├── pages/
│   └── register.page.tsx               # Register route page
├── hooks/
│   └── use-register.ts                 # TanStack Query mutation hook
├── services/
│   └── auth.api.ts                     # API service layer
├── types/
│   └── auth.types.ts                   # TypeScript types
└── utils/
    └── validation.ts                   # Client-side validation helpers
```

---

## Backend Design

### Commands (State Mutations)

| Command | Handler | Description |
|---------|---------|-------------|
| `RegisterCommand` | `RegisterHandler` | Creates User, Tenant, AuthIdentity atomically |

### Command Details

#### RegisterCommand

**Input**:
```typescript
{
  email: string;           // Required, valid email format
  password: string;        // Required, meets policy
  name: string;            // Required, user's display name
  tenantName?: string;     // Optional, defaults to "[Name]'s Workspace"
}
```

**Processing Steps**:
1. Validate email format (RFC 5322)
2. Validate password policy (8+ chars, 1 upper, 1 lower, 1 digit)
3. Check for existing LOCAL AuthIdentity with same email → reject if exists
4. Generate username from email prefix + random suffix
5. Hash password with bcrypt (cost 12)
6. Create Tenant (status=ACTIVE, plan=FREE)
7. Create User (role=ADMIN, linked to tenant)
8. Create AuthIdentity (provider=LOCAL, providerUserId=email)
9. All in single transaction
10. Log success/failure for security audit

**Output**:
```typescript
{
  userId: string;
  email: string;
  tenantId: string;
}
```

### API Endpoints

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| `POST` | `/api/v1/auth/register` | `RegisterCommand` | User registration with tenant creation |

### Error Responses

| Scenario | HTTP Status | Error Code | Error Type |
|----------|-------------|------------|------------|
| Invalid email format | 400 | `VALIDATION_ERROR` | `client` |
| Password policy violation | 400 | `VALIDATION_ERROR` | `client` |
| Missing required fields | 400 | `VALIDATION_ERROR` | `client` |
| Email already registered | 409 | `EMAIL_ALREADY_EXISTS` | `domain` |
| Database failure | 500 | `INTERNAL_ERROR` | `system` |

---

## Frontend Design

### Pages & Routes

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/register` | `RegisterPage` | User registration page |

### State Management

| Store/Hook | Type | Purpose |
|------------|------|---------|
| `useRegister` | TanStack Query Mutation | Server state: registration API call |
| Form state | React useState | UI state: form inputs, loading state |

### Components

| Component | Shadcn Base | Purpose |
|-----------|-------------|---------|
| `RegisterForm` | `Form`, `Input`, `Button` | Registration form with validation |
| `PasswordInput` | `Input` | Password field with visibility toggle |

### User Flow

1. User navigates to `/register`
2. User fills in: email, password, name, (optional) tenant name
3. Client-side validation shows inline errors
4. User submits form → `useRegister` mutation fires
5. On success: Show success toast, redirect to `/login`
6. On error: Show error message (validation details if applicable)

---

## Data Model Overview

> Full details in [data-model.md](./data-model.md)

### Entities

| Entity | Primary Key | Key Fields |
|--------|-------------|------------|
| `Tenant` | UUID | name, status (ACTIVE), plan (FREE), createdAt |
| `User` | UUID | email, name, username, tenantId, role (ADMIN) |
| `AuthIdentity` | UUID | userId, provider (LOCAL), providerUserId (email), passwordHash |

### Relationships

```
Tenant (1) ──────< User (N)
User (1) ──────< AuthIdentity (N)
```

---

## Testing Strategy

### Backend Tests

| Type | Location | Scope |
|------|----------|-------|
| Unit | `server/src/modules/auth/**/*.spec.ts` | Password hashing, username generation, validation |
| Integration | `server/test/auth/` | Register endpoint, transaction rollback |

### Frontend Tests

| Type | Location | Scope |
|------|----------|-------|
| Unit | `client/src/modules/auth/**/*.test.ts` | Form validation, hook behavior |
| E2E | `client/e2e/auth/` | Complete registration flow |

---

## Verification Plan

### Automated Verification
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Lint and type checks pass
- [ ] API contracts match OpenAPI spec

### Manual Verification
- [ ] Register with valid data → success message, redirect to login
- [ ] Register with duplicate email → appropriate error
- [ ] Register with invalid password → validation error with details
- [ ] Check database: User, Tenant, AuthIdentity all created
- [ ] Verify password is hashed (not plain text in DB)

---

## Core/Shared Usage Justification

### Backend Core/Shared

| Location | Code Added/Modified | Justification | Why Not in Feature Module? |
|----------|---------------------|---------------|----------------------------|
| N/A | - | All code resides in `modules/auth/` | - |

### Frontend Shared

| Location | Code Added/Modified | Justification | Why Not in Feature Module? |
|----------|---------------------|---------------|----------------------------|
| N/A | - | All code resides in `modules/auth/` | - |

---

## Complexity Tracking

> No Constitution Check violations.

---

## Open Questions

- [ ] None - all clarifications resolved in spec.md
