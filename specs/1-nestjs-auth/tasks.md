# Tasks: NestJS Authentication System

**Input**: Design documents from `/specs/1-nestjs-auth/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests are NOT included (not explicitly requested in spec).

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1=Local Auth, US2=OAuth, US3=Token Refresh, US4=Sessions, US5=Account Linking

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create project structure

- [x] T001 Install auth dependencies: `npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local simple-oauth2 bcrypt`
- [x] T002 Install dev dependencies: `npm install -D @types/passport-jwt @types/passport-local @types/simple-oauth2 @types/bcrypt`
- [x] T003 Create auth module directory structure per plan.md in `server/src/modules/auth/`
- [x] T004 [P] Add auth environment variables to `server/.env.dev` (JWT_SECRET, JWT_ACCESS_EXPIRATION, etc.)
- [x] T005 [P] Create `server/src/core/jwt/` directory structure

**Checkpoint**: Dependencies installed, directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Entities

- [x] T006 Create database migration for `tenants` table in `server/src/migrations/`
- [x] T007 Create database migration for `users` table with `tenant_id` FK
- [x] T008 Create database migration for `accounts` table with constraints
- [x] T009 Create database migration for `sessions` table
- [x] T010 Run migrations: `npm run migration:up`

### Core Services (shared infrastructure)

- [x] T011 [P] Create `AccountType` enum in `server/src/modules/auth/domain/enums/account-type.enum.ts`
- [x] T012 [P] Create `TokenType` enum in `server/src/modules/auth/domain/enums/token-type.enum.ts`
- [x] T013 [P] Create token payload interfaces in `server/src/core/jwt/interfaces/token-payload.interface.ts`
- [x] T014 [P] Create token response interface in `server/src/core/jwt/interfaces/token-response.interface.ts`
- [x] T015 Implement `JwtService` in `server/src/core/jwt/jwt.service.ts` (access/refresh token generation)
- [x] T016 Create `JwtModule` in `server/src/core/jwt/jwt.module.ts`
- [x] T017 [P] Implement `PasswordService` in `server/src/core/security/password.service.ts` (bcrypt hashing)

### Domain Entities

- [x] T018 [P] Create `Password` value object in `server/src/modules/auth/domain/value-objects/password.vo.ts`
- [x] T019 [P] Create `User` domain entity in `server/src/modules/auth/domain/entities/user.entity.ts`
- [x] T020 [P] Create `Account` domain entity in `server/src/modules/auth/domain/entities/account.entity.ts`
- [x] T021 [P] Create `Session` domain entity in `server/src/modules/auth/domain/entities/session.entity.ts`

- [x] T022 [P] Create `Tenant` domain entity in `server/src/modules/auth/domain/entities/tenant.entity.ts`

### MikroORM Persistence Entities

- [x] T023 [P] Create `UserMikroEntity` in `server/src/modules/auth/infrastructure/persistence/user.mikro-entity.ts`
- [x] T024 [P] Create `AccountMikroEntity` in `server/src/modules/auth/infrastructure/persistence/account.mikro-entity.ts`
- [x] T025 [P] Create `SessionMikroEntity` in `server/src/modules/auth/infrastructure/persistence/session.mikro-entity.ts`

- [x] T026 [P] Create `TenantMikroEntity` in `server/src/modules/auth/infrastructure/persistence/tenant.mikro-entity.ts`

### Repository Interfaces

- [x] T027 [P] Create `IUserRepository` interface in `server/src/modules/auth/domain/repositories/user.repository.interface.ts`
- [x] T028 [P] Create `IAccountRepository` interface in `server/src/modules/auth/domain/repositories/account.repository.interface.ts`
- [x] T029 [P] Create `ISessionRepository` interface in `server/src/modules/auth/domain/repositories/session.repository.interface.ts`

- [x] T030 [P] Create `ITenantRepository` interface in `server/src/modules/auth/domain/repositories/tenant.repository.interface.ts`

### Repository Implementations

- [x] T031 [P] Implement `UserRepository` in `server/src/modules/auth/infrastructure/repositories/user.repository.ts`
- [x] T032 [P] Implement `AccountRepository` in `server/src/modules/auth/infrastructure/repositories/account.repository.ts`
- [x] T033 [P] Implement `SessionRepository` in `server/src/modules/auth/infrastructure/repositories/session.repository.ts`

- [x] T034 [P] Implement `TenantRepository` in `server/src/modules/auth/infrastructure/repositories/tenant.repository.ts`

### DTOs

- [x] T035 [P] Create `RegisterDto` in `server/src/modules/auth/dto/requests/register.dto.ts`
- [x] T036 [P] Create `LoginDto` in `server/src/modules/auth/dto/requests/login.dto.ts`
- [x] T037 [P] Create `AuthTokensDto` response in `server/src/modules/auth/dto/responses/auth-tokens.dto.ts`
- [x] T038 [P] Create `UserProfileDto` response in `server/src/modules/auth/dto/responses/user-profile.dto.ts`

### Guards & Decorators

- [x] T039 [P] Create `@Public()` decorator in `server/src/modules/auth/decorators/public.decorator.ts`
- [x] T040 [P] Create `@CurrentUser()` decorator in `server/src/modules/auth/decorators/current-user.decorator.ts`
- [x] T041 [P] Implement JWT strategy in `server/src/modules/auth/strategies/jwt.strategy.ts`
- [x] T042 [P] Implement `JwtAuthGuard` in `server/src/modules/auth/guards/jwt-auth.guard.ts`

### Auth Module Setup

- [x] T043 Create base `AuthModule` in `server/src/modules/auth/auth.module.ts` (import JwtModule, register entities)
- [x] T044 Register `AuthModule` in `server/src/app.module.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Local Email/Password Registration & Login (Priority: P1) 🎯 MVP

**Goal**: Users can register with email/password and login with email OR username

**Independent Test**: Register user → Login with email → Login with username → Access protected endpoint

### Commands & Handlers

- [ ] T045 [P] [US1] Create `RegisterCommand` in `server/src/modules/auth/application/commands/register.command.ts`
- [ ] T046 [P] [US1] Create `LoginCommand` in `server/src/modules/auth/application/commands/login.command.ts`
- [ ] T047 [US1] Implement `RegisterHandler` in `server/src/modules/auth/application/commands/register.handler.ts`
  - Create User with auto-generated username
  - Create LOCAL Account with hashed password
  - Assign to Tenant (default tenant for now)
  - Create Session and issue tokens
- [ ] T044 [US1] Implement username generation logic (lowercase name, append number if collision)
- [ ] T045 [US1] Implement `LoginHandler` in `server/src/modules/auth/application/commands/login.handler.ts`
  - Accept identifier (email OR username)
  - Validate against LOCAL Account password
  - Create Session and issue tokens

### Passport Strategy

- [ ] T048 [US1] Implement `LocalStrategy` in `server/src/modules/auth/strategies/local.strategy.ts`
- [ ] T049 [US1] Implement `LocalAuthGuard` in `server/src/modules/auth/guards/local-auth.guard.ts`

### Controller

- [ ] T050 [US1] Create `AuthController` in `server/src/modules/auth/controllers/auth.controller.ts`
  - POST `/auth/register` - RegisterCommand
  - POST `/auth/login` - LoginCommand
  - Set refresh token in HTTP-only cookie

### Swagger Documentation

- [ ] T051 [US1] Add Swagger decorators to `AuthController` and DTOs

### Validation

- [ ] T052 [US1] Add password validation (min 8 chars, 1 number, 1 special) to `RegisterDto`
- [ ] T053 [US1] Add email format validation to `RegisterDto` and `LoginDto`

**Checkpoint**: Users can register and login with LOCAL credentials

---

## Phase 4: User Story 2 - OAuth2 Social Login (Priority: P2)

**Goal**: Users can login via Google, GitHub, Facebook OAuth providers

**Independent Test**: Click OAuth login → Complete provider flow → Receive JWT tokens

### OAuth Infrastructure

- [ ] T054 [P] [US2] Create OAuth config interface in `server/src/modules/auth/infrastructure/oauth/oauth.config.ts`
- [ ] T055 [P] [US2] Create `OAuthClass` base abstraction in `server/src/modules/auth/infrastructure/oauth/oauth.class.ts`
- [ ] T056 [P] [US2] Create `OAuthProfile` normalized interface in `server/src/modules/auth/infrastructure/oauth/interfaces/oauth-profile.interface.ts`

### Provider Implementations

- [ ] T057 [P] [US2] Implement `GoogleProvider` in `server/src/modules/auth/infrastructure/oauth/providers/google.provider.ts`
- [ ] T058 [P] [US2] Implement `GitHubProvider` in `server/src/modules/auth/infrastructure/oauth/providers/github.provider.ts`
- [ ] T059 [P] [US2] Implement `FacebookProvider` in `server/src/modules/auth/infrastructure/oauth/providers/facebook.provider.ts`

### OAuth Service

- [ ] T060 [US2] Create `OAuthService` in `server/src/modules/auth/infrastructure/oauth/oauth.service.ts`
  - Generate authorization URLs with state
  - Exchange authorization codes for tokens
  - Fetch and normalize user profiles

### DTOs

- [ ] T061 [P] [US2] Create `OAuthCallbackDto` in `server/src/modules/auth/dto/requests/oauth-callback.dto.ts`

### Commands & Handlers

- [ ] T062 [US2] Create `OAuthCallbackCommand` in `server/src/modules/auth/application/commands/oauth-callback.command.ts`
- [ ] T063 [US2] Implement `OAuthCallbackHandler` in `server/src/modules/auth/application/commands/oauth-callback.handler.ts`
  - Find existing Account by provider + providerId
  - Or find User by email and create new Account (auto-link)
  - Or create new User + Account
  - Create Session and issue tokens

### Controller

- [ ] T064 [US2] Create `OAuthController` in `server/src/modules/auth/controllers/oauth.controller.ts`
  - GET `/auth/oauth/:provider` - Redirect to provider
  - GET `/auth/oauth/:provider/callback` - Handle callback

### Error Handling

- [ ] T065 [US2] Add OAuth provider error handling (unavailable, denied access, invalid code)

**Checkpoint**: Users can login via OAuth providers

---

## Phase 5: User Story 3 - Token Refresh & Rotation (Priority: P3)

**Goal**: Seamless token refresh with rotation for security

**Independent Test**: Let access token expire → Call refresh → Verify new tokens, old refresh invalidated

### Commands & Handlers

- [ ] T066 [US3] Create `RefreshTokensCommand` in `server/src/modules/auth/application/commands/refresh-tokens.command.ts`
- [ ] T067 [US3] Implement `RefreshTokensHandler` in `server/src/modules/auth/application/commands/refresh-tokens.handler.ts`
  - Extract refresh token from cookie
  - Validate against Session's stored hash
  - Detect token reuse → revoke ALL sessions (FR-029a)
  - Generate new token pair
  - Update Session with new refresh token hash (rotation)
- [ ] T068 [US3] Create `LogoutCommand` in `server/src/modules/auth/application/commands/logout.command.ts`
- [ ] T069 [US3] Implement `LogoutHandler` in `server/src/modules/auth/application/commands/logout.handler.ts`
  - Revoke current Session
  - Clear refresh token cookie

### Controller Updates

- [ ] T070 [US3] Add `POST /auth/refresh` endpoint to `AuthController`
- [ ] T071 [US3] Add `POST /auth/logout` endpoint to `AuthController`

**Checkpoint**: Token refresh and logout work correctly

---

## Phase 6: User Story 4 - Session Management (Priority: P4)

**Goal**: Users can view and revoke their active sessions

**Independent Test**: Login from 2 devices → View sessions → Revoke one → Verify it fails

### DTOs

- [ ] T072 [P] [US4] Create `SessionDto` response in `server/src/modules/auth/dto/responses/session.dto.ts`
- [ ] T073 [P] [US4] Create `RevokeSessionDto` in `server/src/modules/auth/dto/requests/revoke-session.dto.ts`

### Queries

- [ ] T074 [US4] Create `GetSessionsQuery` in `server/src/modules/auth/application/queries/get-sessions.query.ts`
- [ ] T075 [US4] Implement `GetSessionsHandler` in `server/src/modules/auth/application/queries/get-sessions.handler.ts`

### Commands

- [ ] T076 [US4] Create `RevokeSessionCommand` in `server/src/modules/auth/application/commands/revoke-session.command.ts`
- [ ] T077 [US4] Implement `RevokeSessionHandler` in `server/src/modules/auth/application/commands/revoke-session.handler.ts`
- [ ] T078 [US4] Create `RevokeAllSessionsCommand` in `server/src/modules/auth/application/commands/revoke-all-sessions.command.ts`
- [ ] T079 [US4] Implement `RevokeAllSessionsHandler` in `server/src/modules/auth/application/commands/revoke-all-sessions.handler.ts`

### Controller

- [ ] T080 [US4] Create `SessionController` in `server/src/modules/auth/controllers/session.controller.ts`
  - GET `/auth/sessions` - List sessions
  - DELETE `/auth/sessions/:sessionId` - Revoke specific
  - DELETE `/auth/sessions` - Revoke all

**Checkpoint**: Session management fully functional

---

## Phase 7: User Story 5 - Account Linking & Unlinking (Priority: P5)

**Goal**: Users can link/unlink additional OAuth providers

**Independent Test**: Login with LOCAL → Link Google → Verify both work → Unlink LOCAL → Verify Google only

### DTOs

- [ ] T081 [P] [US5] Create `AccountDto` response in `server/src/modules/auth/dto/responses/account.dto.ts`

### Queries

- [ ] T082 [US5] Create `GetAccountsQuery` in `server/src/modules/auth/application/queries/get-accounts.query.ts`
- [ ] T083 [US5] Implement `GetAccountsHandler` in `server/src/modules/auth/application/queries/get-accounts.handler.ts`

### Commands

- [ ] T084 [US5] Create `LinkAccountCommand` in `server/src/modules/auth/application/commands/link-account.command.ts`
- [ ] T085 [US5] Implement `LinkAccountHandler` in `server/src/modules/auth/application/commands/link-account.handler.ts`
  - Initiate OAuth flow for logged-in user
  - On callback, link new Account to existing User
- [ ] T086 [US5] Create `UnlinkAccountCommand` in `server/src/modules/auth/application/commands/unlink-account.command.ts`
- [ ] T087 [US5] Implement `UnlinkAccountHandler` in `server/src/modules/auth/application/commands/unlink-account.handler.ts`
  - Prevent unlinking last Account

### Controller Updates

- [ ] T088 [US5] Add to `OAuthController`:
  - POST `/auth/accounts/link/:provider` - Initiate linking
- [ ] T089 [US5] Add Account endpoints to controller:
  - GET `/auth/accounts` - List linked accounts
  - DELETE `/auth/accounts/:accountId` - Unlink account

**Checkpoint**: Full account linking/unlinking works

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Security Hardening

- [ ] T090 [P] Add rate limiting to auth endpoints in `AuthController`
- [ ] T091 [P] Add structured logging for all auth events
- [ ] T092 [P] Implement session cleanup job for expired/soft-deleted sessions (30 days)

### Documentation

- [ ] T093 [P] Generate OpenAPI documentation and verify against `contracts/auth.openapi.yaml`
- [ ] T094 [P] Update `quickstart.md` with actual API examples

### Final Validation

- [ ] T095 Run full verification plan from `plan.md`:
  - Register → Login (email) → Login (username) ✓
  - OAuth flow (Google) ✓
  - Token refresh and rotation ✓
  - Session list and revocation ✓
  - Account linking/unlinking ✓

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - **BLOCKS all user stories**
- **Phases 3-7 (User Stories)**: All depend on Phase 2 completion
  - Can proceed in priority order (P1 → P2 → P3 → P4 → P5)
  - US1 (P1) is MVP - can deploy after Phase 3
- **Phase 8 (Polish)**: After all desired stories complete

### User Story Dependencies

| Story | Depends On | Can Run Parallel With |
|-------|------------|-----------------------|
| US1 (Local Auth) | Phase 2 only | - |
| US2 (OAuth) | Phase 2 only | US1 |
| US3 (Token Refresh) | US1 (needs login flow) | US2 |
| US4 (Sessions) | US1 or US2 | US3, US5 |
| US5 (Linking) | US1 AND US2 | US4 |

### Parallel Opportunities

**Phase 2** (after T010):
```
T011, T012, T013, T014 - All enum/interfaces in parallel
T018, T019, T020, T021 - All domain entities in parallel
T022, T023, T024 - All MikroORM entities in parallel
T025, T026, T027 - All repository interfaces in parallel
T028, T029, T030 - All repository implementations in parallel
T031, T032, T033, T034 - All DTOs in parallel
```

**Phase 4** (US2):
```
T052, T053, T054 - OAuth infrastructure in parallel
T055, T056, T057 - All OAuth providers in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T040)
3. Complete Phase 3: User Story 1 (T041-T051)
4. **STOP and VALIDATE**: Test registration and login
5. Deploy MVP with local auth only

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Local Auth) → **MVP! Deploy**
3. Add US2 (OAuth) → Deploy (more login options)
4. Add US3 (Token Refresh) → Deploy (better security)
5. Add US4 (Sessions) → Deploy (user control)
6. Add US5 (Linking) → Deploy (flexibility)
7. Polish → Final release

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 93 |
| **Phase 1 (Setup)** | 5 |
| **Phase 2 (Foundational)** | 35 |
| **Phase 3 (US1 - Local Auth)** | 11 |
| **Phase 4 (US2 - OAuth)** | 12 |
| **Phase 5 (US3 - Token Refresh)** | 6 |
| **Phase 6 (US4 - Sessions)** | 9 |
| **Phase 7 (US5 - Linking)** | 9 |
| **Phase 8 (Polish)** | 6 |
| **Parallelizable Tasks** | 48 |

**MVP Scope**: Phases 1-3 (51 tasks) → Local authentication working
