# Feature Specification: Local Authentication Login Flow

**Feature Branch**: `002-local-auth-login`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: Create a Specification for a Local Authentication (Email / Password) Login Flow designed using Domain-Driven Design (DDD) principles.

## Overview

This specification defines the **Local Authentication Login Flow** where a user authenticates using email and password credentials. The design follows Domain-Driven Design (DDD) principles to ensure clear separation of concerns, business rule enforcement at the domain layer, and framework-agnostic implementation.

### Scope

**In Scope**:
- Email and password authentication flow
- Business rule validation
- Domain responsibilities and invariants
- Application orchestration
- Error handling and domain events
- Session management

**Out of Scope**:
- OAuth or third-party authentication providers
- Password reset functionality
- Account registration

## Clarifications

### Session 2026-02-04

- Q: What are the expiration durations for access and refresh tokens? → A: 7 days for access tokens, 30 days for refresh tokens (configurable via environment variables)
- Q: Should the system track consecutive failed login attempts per user/IP? → A: Yes, track failed attempts for rate limiting integration (infrastructure layer can use this data for brute-force protection)

## Ubiquitous Language

The following terms form the shared vocabulary for this feature:

- **User**: A registered account in the system with a unique identity
- **AuthIdentity**: A credential identity used to authenticate a User (supports multiple providers)
- **Local Identity**: An AuthIdentity using email or username and password authentication (provider = LOCAL)
- **Session**: A login session associated with a User and an AuthIdentity, representing an active authenticated state
- **Login Attempt**: A request to authenticate using credentials
- **Password Hash**: A one-way cryptographic hash of the user's password
- **Refresh Token**: A one-time-use token stored as a hash for session renewal

## User Scenarios & Testing

### User Story 1 - Successful Login with Valid Credentials (Priority: P1)

A registered user with an active account enters their correct email or username and password to access the system. The system validates their credentials, creates a new session, and grants access.

**Why this priority**: This is the core happy path that enables all authenticated functionality. Without this, users cannot access the system.

**Independent Test**: Can be fully tested by creating a test user, submitting valid credentials via the login endpoint, and verifying that access tokens and a session are returned.

**Acceptance Scenarios**:

1. **Given** a registered user with email "user@example.com" and correct password, **When** they submit login credentials, **Then** the system validates the password, creates a new session, and returns access and refresh tokens
2. **Given** an authenticated session exists, **When** the user attempts to access protected resources with valid tokens, **Then** the system grants access without re-authentication

---

### User Story 2 - Login Rejection for Invalid Credentials (Priority: P1)

A user attempts to log in with either a non-existent email or an incorrect password. The system rejects the login attempt without revealing which credential was invalid.

**Why this priority**: Security is fundamental. Preventing unauthorized access and avoiding account enumeration attacks are critical from day one.

**Independent Test**: Can be tested by submitting various invalid credential combinations and verifying that all return a generic "Invalid credentials" error without leaking account existence information.

**Acceptance Scenarios**:

1. **Given** a user provides a non-existent email, **When** they submit login credentials, **Then** the system returns "InvalidCredentials" error without revealing the email doesn't exist
2. **Given** a user provides a valid email but incorrect password, **When** they submit login credentials, **Then** the system returns "InvalidCredentials" error without revealing the password was incorrect
3. **Given** multiple failed login attempts, **When** credentials are validated, **Then** all failures return the same generic error message

---

### User Story 3 - Login Prevention for Blocked Accounts (Priority: P1)

A user whose account has been administratively blocked attempts to log in. Even with correct credentials, the system prevents authentication and informs them their account is blocked.

**Why this priority**: Account security and administrative control are essential. This prevents compromised or policy-violating accounts from accessing the system.

**Independent Test**: Can be tested by creating a user, setting their status to BLOCKED, attempting login with valid credentials, and verifying that access is denied with a "UserBlocked" error.

**Acceptance Scenarios**:

1. **Given** a user account with status BLOCKED, **When** they submit valid credentials, **Then** the system returns "UserBlocked" error and does not create a session
2. **Given** a user was previously logged in and their account is subsequently blocked, **When** they attempt to use existing tokens, **Then** the system denies access (verified at authorization layer, not login layer)

---

### User Story 4 - Audit Trail for All Login Attempts (Priority: P2)

Every login attempt, whether successful or failed, generates a domain event that can be consumed for audit logging, security monitoring, and analytics.

**Why this priority**: While not blocking core functionality, audit capability is important for security compliance and operational visibility. It should be designed into the system from the start.

**Independent Test**: Can be tested by triggering both successful and failed login attempts and verifying that corresponding domain events (LoginSucceeded, LoginFailed) are emitted with correct metadata.

**Acceptance Scenarios**:

1. **Given** a successful login, **When** authentication completes, **Then** a LoginSucceeded event is emitted containing userId, authIdentityId, sessionId, and device metadata
2. **Given** a failed login attempt, **When** authentication fails, **Then** a LoginFailed event is emitted containing the email, failure reason, and attempt metadata
3. **Given** a new session is created, **When** session creation completes, **Then** a SessionCreated event is emitted with sessionId, userId, IP address, and user agent

---

### Edge Cases

- **What happens when** a user has no LOCAL AuthIdentity (only OAuth)?
  - Login fails with InvalidCredentials error (same as non-existent email to prevent enumeration)
  
- **What happens when** the same user logs in from multiple devices simultaneously?
  - Each login creates an independent session; all sessions remain valid unless explicitly revoked
  
- **What happens when** a password hash algorithm needs to be upgraded?
  - Password verification is encapsulated in AuthIdentity; hash migration is handled separately and not part of the login flow
  
- **How does the system handle** concurrent login attempts for the same user?
  - Each attempt is processed independently; concurrent sessions are allowed
  
- **What happens when** a user's status changes from ACTIVE to BLOCKED mid-session?
  - Active sessions may remain valid (depending on authorization layer implementation); new logins are blocked

## Requirements

### Functional Requirements

- **FR-001**: System MUST validate that the provided email corresponds to exactly one LOCAL AuthIdentity
- **FR-002**: System MUST verify the provided password against the stored password hash using the AuthIdentity's verification method
- **FR-003**: System MUST validate that the associated User account has status ACTIVE before allowing authentication
- **FR-004**: System MUST create a new Session upon successful authentication containing userId, authIdentityId, refreshTokenHash, ipAddress, userAgent, and status
- **FR-005**: System MUST generate both access and refresh tokens for successful authentication
- **FR-006**: System MUST store refresh tokens as one-way hashes (never plaintext)
- **FR-007**: System MUST emit a LoginSucceeded domain event for every successful authentication
- **FR-008**: System MUST emit a LoginFailed domain event for every failed authentication attempt
- **FR-009**: System MUST emit a SessionCreated domain event when a new session is established
- **FR-010**: System MUST return identical error responses for non-existent emails and incorrect passwords (InvalidCredentials)
- **FR-011**: System MUST return a distinct error (UserBlocked) when a user account is blocked
- **FR-012**: System MUST enforce that password verification logic resides in the AuthIdentity aggregate
- **FR-013**: System MUST ensure no passwords are ever logged or exposed in plaintext
- **FR-014**: System MUST normalize email addresses before lookup (lowercase, trimmed)
- **FR-015**: System MUST track failed login attempts (by email and IP address) to support rate limiting and security monitoring at the infrastructure layer

### Key Entities

- **User (Aggregate Root)**:
  - Represents a registered account in the system
  - Attributes: id, email, status (ACTIVE, BLOCKED)
  - Responsible for: User-level business rules and state management
  
- **AuthIdentity (Aggregate)**:
  - Represents a credential identity for authentication
  - Attributes: id, userId, provider (LOCAL, OAUTH, etc.), providerIdentity (email for LOCAL), passwordHash
  - Responsible for: Password verification, credential validation
  - Invariant: Each User may have multiple AuthIdentities, but only one per provider+providerIdentity combination
  
- **Session (Aggregate)**:
  - Represents an active login session
  - Attributes: id, userId, authIdentityId, refreshTokenHash, ipAddress, userAgent, status, createdAt, expiresAt
  - Default Expiration: Access tokens expire after 7 days, refresh tokens after 30 days (configurable via environment variables)
  - Responsible for: Session lifecycle management, refresh token validation
  - Invariant: Each session is tied to one User and one AuthIdentity; refresh tokens are one-time-use

- **LoginAttemptTracker (Entity)**:
  - Tracks failed login attempts for security monitoring and rate limiting
  - Attributes: id, identifier (email or IP), attemptCount, firstAttemptAt, lastAttemptAt, windowExpiresAt
  - Responsible for: Recording failed attempts, providing data for rate limiting decisions
  - Note: Actual rate limiting enforcement is delegated to infrastructure layer

## Domain Model

The domain model enforces the following structure:

```
User (Aggregate Root)
├── id: UUID
├── email: Email (Value Object)
└── status: UserStatus (ACTIVE | BLOCKED)

AuthIdentity (Aggregate)
├── id: UUID
├── userId: UUID (reference to User)
├── provider: AuthProvider (LOCAL | OAUTH)
├── providerIdentity: string (email for LOCAL)
└── passwordHash: string (bcrypt/argon2 hash)

Session (Aggregate)
├── id: UUID
├── userId: UUID (reference to User)
├── authIdentityId: UUID (reference to AuthIdentity)
├── refreshTokenHash: string
├── ipAddress: string
├── userAgent: string
├── status: SessionStatus (ACTIVE | REVOKED | EXPIRED)
├── createdAt: DateTime
└── expiresAt: DateTime
```

## Business Rules

The following business rules are enforced at the domain layer:

1. **BR-001**: A User MUST have exactly one LOCAL AuthIdentity per email address
2. **BR-002**: Login MUST fail if no AuthIdentity exists for the provided email and provider=LOCAL
3. **BR-003**: Login MUST fail if password verification fails
4. **BR-004**: Login MUST fail if the User status is BLOCKED
5. **BR-005**: Password verification is the exclusive responsibility of the AuthIdentity aggregate
6. **BR-006**: A successful login MUST always create a new Session (no session reuse)
7. **BR-007**: Refresh tokens MUST be stored as one-way hashes and are one-time-use
8. **BR-008**: The domain layer MUST NOT depend on infrastructure concerns (databases, JWT libraries, HTTP)

## Application Flow

### Successful Login Flow

```
1. Receive login request (email, password, device info)
2. Normalize email (lowercase, trim)
3. Validate input format (email format, password not empty)
4. Retrieve AuthIdentity by provider=LOCAL and providerIdentity=email
   - If not found → Return InvalidCredentials error
5. Verify password using AuthIdentity.verifyPassword(password)
   - If verification fails → Return InvalidCredentials error
6. Load associated User by userId
7. Validate User.status === ACTIVE
   - If BLOCKED → Return UserBlocked error
8. Create new Session aggregate with device metadata
9. Issue access and refresh tokens (application layer responsibility)
10. Emit LoginSucceeded event
11. Emit SessionCreated event
12. Return tokens and session metadata
```

### Failed Login Flow

```
1. Receive login request (email, password, device info)
2. Normalize email (lowercase, trim)
3. Validate input format
   - If invalid → Return InvalidCredentials error
4. Retrieve AuthIdentity by provider=LOCAL and providerIdentity=email
   - If not found → Emit LoginFailed event → Return InvalidCredentials error
5. Verify password using AuthIdentity.verifyPassword(password)
   - If fails → Emit LoginFailed event → Return InvalidCredentials error
6. Load associated User
   - If User.status === BLOCKED → Emit LoginFailed event → Return UserBlocked error
```

## Error Handling

### Error Definitions

| Error Code | HTTP Status | Condition | User Message |
|-----------|-------------|-----------|--------------|
| InvalidCredentials | 401 | Email not found OR password incorrect | "Invalid email or password" |
| UserBlocked | 403 | User account status is BLOCKED | "Your account has been blocked. Please contact support." |
| AuthIdentityNotFound | 401 | No LOCAL identity exists for email | "Invalid email or password" (mapped to InvalidCredentials) |

**Security Note**: All credential-related errors return the same generic message to prevent account enumeration attacks.

### Error Mapping

Errors are defined at the domain layer and mapped to HTTP responses at the application layer:
- Domain errors are rich objects with context
- Application layer maps domain errors to appropriate HTTP status codes
- Infrastructure layer (controllers) serializes errors to API response format

## Domain Events

### LoginSucceeded

Emitted when a user successfully authenticates.

```typescript
{
  eventType: 'LoginSucceeded',
  aggregateId: userId,
  payload: {
    userId: UUID,
    authIdentityId: UUID,
    sessionId: UUID,
    ipAddress: string,
    userAgent: string,
    timestamp: DateTime
  }
}
```

### LoginFailed

Emitted when an authentication attempt fails.

```typescript
{
  eventType: 'LoginFailed',
  payload: {
    email: string,
    reason: 'INVALID_CREDENTIALS' | 'USER_BLOCKED' | 'AUTH_IDENTITY_NOT_FOUND',
    ipAddress: string,
    userAgent: string,
    timestamp: DateTime
  }
}
```

### SessionCreated

Emitted when a new session is established.

```typescript
{
  eventType: 'SessionCreated',
  aggregateId: sessionId,
  payload: {
    sessionId: UUID,
    userId: UUID,
    authIdentityId: UUID,
    ipAddress: string,
    userAgent: string,
    expiresAt: DateTime,
    timestamp: DateTime
  }
}
```

## Non-Functional Requirements

- **NFR-001**: Passwords MUST never be stored or logged in plaintext anywhere in the system
- **NFR-002**: Domain layer MUST NOT depend on infrastructure (NestJS, databases, HTTP, JWT libraries)
- **NFR-003**: All login attempts MUST be auditable via domain events
- **NFR-004**: Design MUST support adding OAuth and other authentication providers in the future without domain model changes
- **NFR-005**: Password hashing MUST use industry-standard algorithms (bcrypt, argon2) with appropriate cost factors
- **NFR-006**: Email normalization MUST be consistent across the system (lowercase, trimmed)
- **NFR-007**: Error responses MUST NOT leak information about account existence
- **NFR-008**: Token expiration durations MUST be configurable via environment variables (default: 7 days for access tokens, 30 days for refresh tokens)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can successfully authenticate with valid credentials and receive access tokens within 500ms (95th percentile)
- **SC-002**: Invalid login attempts are rejected with appropriate errors without leaking account existence information (100% of attempts)
- **SC-003**: All login attempts (successful and failed) generate audit events that can be consumed for security monitoring (100% coverage)
- **SC-004**: Blocked accounts are prevented from authenticating even with valid credentials (100% of attempts)
- **SC-005**: The domain model can be tested independently of infrastructure without requiring NestJS, databases, or HTTP servers
- **SC-006**: System can support multiple concurrent sessions per user without session collision or data corruption
- **SC-007**: Password verification failures and non-existent email lookups return identical error responses to prevent enumeration attacks

## Assumptions

1. Email addresses are unique identifiers for local authentication
2. Users are already registered before attempting login (registration is a separate feature)
3. The system has existing User and AuthIdentity aggregates in the domain
4. Token generation (JWT or other) is handled by the application/infrastructure layer
5. Session expiration and cleanup are handled separately from the login flow
6. Rate limiting and brute-force protection are handled at the infrastructure layer (not domain concern)
7. Multi-factor authentication (if required) will be added as a separate concern

## Implementation Notes

### Framework Independence

While the implementation uses NestJS and TypeScript, the specification deliberately avoids framework-specific details:
- Domain models are pure TypeScript classes
- Business rules are enforced in domain aggregates
- Application layer orchestrates the flow
- Infrastructure layer handles NestJS-specific concerns (controllers, guards, decorators)

### Extensibility

The design supports future authentication methods:
- The `AuthIdentity` aggregate uses a `provider` discriminator (LOCAL, OAUTH, etc.)
- Adding new providers requires new AuthIdentity types, not changes to the domain model
- The login flow can be extended to handle provider-specific logic via polymorphism

### Testing Strategy

- Domain logic can be unit tested without infrastructure dependencies
- Application flow can be integration tested with in-memory repositories
- Full end-to-end tests require infrastructure (database, HTTP server)
