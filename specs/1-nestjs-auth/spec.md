# Feature Specification: NestJS Authentication System

**Feature Branch**: `1-nestjs-auth`  
**Created**: 2026-01-18  
**Status**: Draft  
**Input**: User description: "Full NestJS authentication system with local/OAuth2 login, JWT tokens, session management"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Local Email/Password Registration & Login (Priority: P1)

A new user visits the application and registers using their name, email address, and a password. The system automatically generates a unique username from the user's name. After registration, the user can log in using **either their email or username** along with their password, receiving JWT access and refresh tokens. The user can then access protected resources.

**Why this priority**: This is the foundational authentication flow. Without local auth, users cannot access the system. It must work before any other features.

**Independent Test**: Can be fully tested by registering a new user, logging in with email or username, and accessing a protected endpoint. Delivers basic authentication capability.

**Acceptance Scenarios**:

1. **Given** a guest user, **When** they submit a valid name, email, and password for registration, **Then** a new User (with auto-generated username) and Account (type LOCAL) are created, and the user is logged in with JWT tokens.
2. **Given** a registered user, **When** they submit their **email** and correct password, **Then** they are authenticated successfully.
3. **Given** a registered user, **When** they submit their **username** and correct password, **Then** they are authenticated successfully.
4. **Given** a registered user, **When** they submit correct credentials (email or username + password), **Then** they receive an access token, a refresh token (via HTTP-only cookie), and a new Session is created.
5. **Given** a registered user, **When** they submit incorrect credentials, **Then** they receive an authentication error without revealing whether the identifier or password was wrong.
6. **Given** a user registering with name "John Doe", **When** "johndoe" is already taken, **Then** the system generates a unique username like "johndoe1" or "johndoe2".
4. **Given** a logged-in user, **When** their access token expires, **Then** they can use the refresh token to obtain a new access token without re-entering credentials.

---

### User Story 2 - OAuth2 Social Login (Priority: P2)

A user chooses to log in via a third-party provider (Google, Facebook, GitHub). The system redirects them to the provider, handles the callback, and either links the account to an existing user or creates a new user.

**Why this priority**: OAuth2 login significantly reduces friction for users and is a common expectation. It builds on the User/Account foundation from P1.

**Independent Test**: Can be tested by initiating OAuth flow with a configured provider, completing authorization, and verifying token issuance.

**Acceptance Scenarios**:

1. **Given** a guest user, **When** they click "Login with Google" and complete authorization, **Then** if no matching Account exists, a new User and Account (type GOOGLE) are created, and they are logged in.
2. **Given** a guest user with an existing User (matching email) but no GOOGLE Account, **When** they complete Google OAuth, **Then** a new GOOGLE Account is linked to the existing User.
3. **Given** a user with an existing GOOGLE Account, **When** they complete Google OAuth, **Then** they are authenticated using the existing Account.
4. **Given** any OAuth flow, **When** the provider callback includes valid tokens, **Then** the system normalizes the provider profile and issues JWT tokens.

---

### User Story 3 - Token Refresh & Rotation (Priority: P3)

A logged-in user's access token expires. The system provides seamless token refresh using the refresh token stored in an HTTP-only cookie. Refresh tokens are rotated on each use for security.

**Why this priority**: Essential for maintaining user sessions securely without requiring frequent re-authentication. Depends on P1/P2 token issuance.

**Independent Test**: Can be tested by letting an access token expire, calling the refresh endpoint, and verifying new tokens are issued while the old refresh token is invalidated.

**Acceptance Scenarios**:

1. **Given** a user with a valid refresh token cookie, **When** they call the refresh endpoint, **Then** a new access token and a new refresh token are issued.
2. **Given** a user with a valid refresh token, **When** refresh succeeds, **Then** the old refresh token is invalidated (rotation).
3. **Given** an invalidated or blacklisted refresh token, **When** used for refresh, **Then** the request is rejected and the user must re-authenticate.

---

### User Story 4 - Session Management (Priority: P4)

A user can view their active login sessions across devices, revoke individual sessions, or log out from all devices. Each session tracks device/browser information.

**Why this priority**: Provides users control over their security posture. Builds on Session entity from P1-P3.

**Independent Test**: Can be tested by logging in from multiple browsers, viewing sessions, revoking one, and verifying that revoked session no longer works.

**Acceptance Scenarios**:

1. **Given** a logged-in user with multiple sessions, **When** they request session list, **Then** all active sessions with device info and last activity are returned.
2. **Given** a user viewing sessions, **When** they revoke a specific session, **Then** that session's refresh token is invalidated and subsequent requests fail.
3. **Given** a user, **When** they trigger "logout from all devices", **Then** all sessions except the current one (optionally current too) are revoked.
4. **Given** a user, **When** they log out, **Then** the current session is revoked and cookies are cleared.

---

### User Story 5 - Account Linking & Unlinking (Priority: P5)

A logged-in user can link additional authentication providers to their account or unlink existing ones (as long as at least one Account remains).

**Why this priority**: Enhances user flexibility but not critical for initial authentication. Depends on multi-Account architecture.

**Independent Test**: Can be tested by logging in with LOCAL, linking GOOGLE, verifying both work, then unlinking LOCAL and verifying only GOOGLE remains.

**Acceptance Scenarios**:

1. **Given** a logged-in user with a LOCAL account, **When** they initiate Google linking and complete OAuth, **Then** a GOOGLE Account is added to their User.
2. **Given** a user with multiple Accounts, **When** they unlink one Account, **Then** the Account is removed but the User persists.
3. **Given** a user with only one Account, **When** they attempt to unlink it, **Then** the request is rejected with an error.

---

### Edge Cases

- What happens when OAuth provider returns an error or denies access?
- How does the system handle OAuth callback with an already-used authorization code?
- ~~What happens if a refresh token is used concurrently from two different requests?~~ → Detect as potential theft, revoke ALL user sessions.
- How does the system handle expired or malformed JWT tokens?
- How does the system handle expired or malformed JWT tokens?
- ~~What happens if a user tries to register with an email already linked to an OAuth account?~~ → Allow registration, link LOCAL Account to existing User (auto-merge).
- ~~How does the system handle OAuth provider downtime?~~ → Show specific error, suggest alternative login method.

## Requirements *(mandatory)*

### Functional Requirements

**User & Account Management**

- **FR-001**: System MUST separate User identity from authentication methods via an Account entity.
- **FR-002**: A User MUST be able to have multiple Accounts (LOCAL, GOOGLE, FACEBOOK, GITHUB, etc.).
- **FR-003**: Each Account MUST be linked to exactly one User.
- **FR-004**: System MUST NOT delete a User when an Account is removed, unless it is the last Account.
- **FR-005**: System MUST prevent unlinking the last Account from a User.
- **FR-005a**: Each User MUST be linked to exactly one Tenant (for multi-tenancy expansion).
- **FR-005b**: Tenant assignment occurs during registration or first OAuth login.
- **FR-005c**: All User data access MUST be scoped by Tenant ID.

**Local Authentication**

- **FR-006**: System MUST allow users to register with name, email, and password.
- **FR-007**: System MUST auto-generate a unique username from the user's name during registration.
- **FR-008**: Username MUST be derived from user's name (lowercase, no spaces, alphanumeric).
- **FR-009**: If generated username already exists, system MUST append a number to ensure uniqueness (e.g., johndoe → johndoe1 → johndoe2).
- **FR-010**: System MUST securely hash passwords before storage.
- **FR-010a**: Passwords MUST be minimum 8 characters with at least 1 number and 1 special character.
- **FR-011**: System MUST validate email uniqueness during registration.
- **FR-011a**: If registering email matches existing OAuth User, system MUST link new LOCAL Account to that User (auto-merge) instead of blocking.
- **FR-012**: System MUST validate username uniqueness.
- **FR-013**: System MUST authenticate users by verifying **email OR username** along with password against the LOCAL Account.
- **FR-014**: Login form MUST accept a single identifier field that works with either email or username.

**OAuth2 Authentication**

- **FR-015**: System MUST support external OAuth2 providers (Google, GitHub, Facebook initially).
- **FR-016**: System MUST generate authorization URLs with proper state parameter for CSRF protection.
- **FR-017**: System MUST handle OAuth2 callbacks and exchange authorization codes for tokens.
- **FR-018**: System MUST normalize provider profiles to internal Account format.
- **FR-019**: If OAuth login email matches existing Account → authenticate via that Account.
- **FR-020**: If OAuth login email matches existing User but no Account for that provider → link new Account to User.
- **FR-021**: If OAuth login has no matching User or Account → create new User (with auto-generated username from provider name) and Account.
- **FR-022**: OAuth provider configurations MUST be environment-driven.
- **FR-022a**: If OAuth provider is unavailable, system MUST show specific error message and suggest trying again or using alternative login method.

**JWT Token Management**

- **FR-023**: System MUST issue JWT access tokens upon successful authentication.
- **FR-024**: System MUST issue JWT refresh tokens stored in HTTP-only cookies.
- **FR-025**: Access tokens MUST have a short expiration time (configurable, default ~15 minutes).
- **FR-026**: Refresh tokens MUST have a longer expiration time (configurable, default ~7 days).
- **FR-027**: JWT tokens MUST be issued per User, not per Account.
- **FR-028**: System MUST support refresh token rotation (new refresh token on each use).
- **FR-029**: System MUST support refresh token blacklisting for invalidation.
- **FR-029a**: If refresh token reuse is detected (same token used twice), system MUST revoke ALL sessions for that User as a security measure.
- **FR-030**: User entity MUST store a token version for global token invalidation.

**Session Management**

- **FR-031**: Each login MUST create a Session record.
- **FR-032**: Session MUST store a hashed refresh token.
- **FR-033**: System MUST support multiple concurrent sessions per User.
- **FR-034**: System MUST allow revocation of individual sessions.
- **FR-035**: System MUST allow global session revocation (logout from all devices).
- **FR-036**: Refresh token flow MUST validate against active Session.
- **FR-036a**: Expired or revoked sessions MUST be soft-deleted and retained for 30 days for audit trail.

**Security**

- **FR-037**: System MUST use secure, HTTP-only, SameSite cookies for refresh tokens.
- **FR-038**: OAuth2 flows MUST use state parameter for CSRF protection.
- **FR-039**: System MUST log all authentication events for auditing.

### Key Entities

- **User**: Core identity entity. Contains name, unique username (auto-generated), profile information, token version for global invalidation, **tenant reference**, and references to Accounts and Sessions.
- **Tenant**: Represents an organization/workspace. Users belong to exactly one Tenant. (Entity defined in separate tenant module, referenced here via FK).
- **Account**: Represents a login method. Has a type (LOCAL, GOOGLE, GITHUB, etc.), provider-specific ID, email, and credentials/tokens as applicable. Belongs to one User.
- **Session**: Represents an active login session. Contains hashed refresh token, device/user-agent info, IP address, last activity timestamp, revocation status, and soft-delete timestamp. Retained for 30 days post-expiration. Belongs to one User.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration and first login in under 60 seconds.
- **SC-002**: OAuth login completes (from click to authenticated state) in under 5 seconds under normal network conditions.
- **SC-003**: Token refresh completes in under 500ms.
- **SC-004**: 99.9% of valid authentication requests succeed without errors.
- **SC-005**: Users can add a new OAuth provider to their account with 3 or fewer clicks.
- **SC-006**: Session revocation takes effect immediately (within 1 second).
- **SC-007**: System supports at least 3 concurrent sessions per user without issues.
- **SC-008**: Adding a new OAuth provider requires only configuration changes (no core code modifications).

## Assumptions

- PostgreSQL is available and configured as the database.
- Environment variables are used for all secrets and provider configurations.
- The NestJS server setup from the previous task is complete and functional.
- Frontend integration is out of scope for this specification; this covers backend API only.
- Email verification is not required for MVP but may be added later.
- Password reset flow is not included in this specification but follows similar patterns.

## Clarifications

### Session 2026-01-19

- Q: What are the password strength requirements? → A: Minimum 8 characters + at least 1 number and 1 special character.
- Q: What happens if a refresh token is used concurrently? → A: Detect as potential theft → revoke ALL user sessions.
- Q: What happens if registering with email already linked to OAuth? → A: Allow registration, link LOCAL Account to existing User (auto-merge).
- Q: How long are session records retained after logout/expiration? → A: Soft-delete, retain for 30 days for audit trail.
- Q: How does the system handle OAuth provider downtime? → A: Show specific error message, suggest alternative login method.
