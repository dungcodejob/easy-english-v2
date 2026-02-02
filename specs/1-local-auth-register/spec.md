# Feature Specification: Local Auth Register with Tenant Creation

**Feature Branch**: `1-local-auth-register`  
**Created**: 2026-02-01  
**Status**: Draft  
**Input**: User description: "Design and implement the REGISTER feature using LOCAL authentication (email + password) and automatically create a Tenant for the registering user"

## Clarifications

### Session 2026-02-01

- Q: Which password hashing algorithm should be used? → A: bcrypt with cost factor 12
- Q: What should the registration success response contain? → A: Message + basic info (userId, email, tenantId)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Registration (Priority: P1)

A new user wants to create an account using their email and password. Upon successful registration, the system automatically creates a workspace (tenant) where they become the owner/admin.

**Why this priority**: This is the core functionality - without registration, users cannot access the platform. It delivers immediate value by allowing new users to onboard.

**Independent Test**: Can be fully tested by submitting valid registration data and verifying that a user account and tenant are created.

**Acceptance Scenarios**:

1. **Given** a visitor with a valid email not yet registered, **When** they submit registration with email, password, name, and tenant name, **Then** a new user account is created with an auto-generated username, a new tenant is created, and the user is assigned as ADMIN of that tenant.

2. **Given** a visitor completes registration successfully, **When** the system processes the request, **Then** an authentication identity record is created with provider=LOCAL and the email as providerUserId.

3. **Given** a visitor submits valid registration data, **When** the registration succeeds, **Then** they receive a success message and are redirected to the login page to authenticate.

4. **Given** a visitor registers with email "john.doe@example.com", **When** the system creates the user account, **Then** a unique username is automatically generated based on the email prefix (e.g., "john_doe"), normalized to lowercase alphanumeric + underscore, with sequential suffix if taken (e.g., "john_doe_1").

---

### User Story 2 - Duplicate Email Prevention (Priority: P1)

A user attempts to register with an email that is already registered for LOCAL authentication. The system prevents duplicate accounts and provides clear feedback.

**Why this priority**: Critical for data integrity and security - prevents account confusion and potential security issues from duplicate credentials.

**Independent Test**: Can be tested by attempting to register with an already-registered email and verifying rejection with appropriate error message.

**Acceptance Scenarios**:

1. **Given** an email already exists with provider=LOCAL, **When** a user attempts to register with the same email, **Then** registration is rejected with a clear error message indicating the email is already in use.

2. **Given** an email exists with provider=GOOGLE, **When** a user attempts to register with the same email using LOCAL provider, **Then** registration is allowed (email uniqueness is per provider).

---

### User Story 3 - Input Validation (Priority: P2)

Users must provide valid input data during registration. The system validates all fields and provides helpful error messages.

**Why this priority**: Essential for data quality and user experience, but secondary to core registration flow.

**Independent Test**: Can be tested by submitting various invalid inputs and verifying appropriate validation errors are returned.

**Acceptance Scenarios**:

1. **Given** a user submits an invalid email format, **When** the system validates the request, **Then** a clear validation error is returned specifying the email format issue.

2. **Given** a user submits a password not meeting requirements, **When** the system validates the request, **Then** a clear validation error explains the password requirements (minimum 8 characters, at least one uppercase, one lowercase, one number).

3. **Given** a user submits empty required fields, **When** the system validates the request, **Then** validation errors indicate which fields are missing.

---

### Edge Cases

- What happens when the database fails during multi-entity creation (user, tenant, auth-identity)? → Transaction rollback ensures atomic operation.
- How does the system handle concurrent registration attempts with the same email? → First successful registration locks the email; second attempt receives duplicate error.
- What happens if tenant name is empty? → System generates a default tenant name based on user's name (e.g., "[Name]'s Workspace").
- What happens with very long inputs? → System enforces maximum length limits: email (255), password (128), name (100), tenantName (100), username (50).
- What happens if the auto-generated username already exists? → System appends sequential numeric suffix (_1, _2, ...) to ensure uniqueness.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept registration requests with email, password, name, and tenant name fields.
- **FR-002**: System MUST validate email format according to RFC 5322 standard.
- **FR-003**: System MUST enforce password policy: minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number.
- **FR-004**: System MUST check for existing LOCAL auth identity with the same email before creating new user.
- **FR-005**: System MUST hash passwords using bcrypt algorithm with cost factor 12 before storage (password must never be stored in plain text).
- **FR-006**: System MUST create a new Tenant with status=ACTIVE and plan=FREE upon successful registration.
- **FR-007**: System MUST create a new User linked to the newly created Tenant with role=ADMIN.
- **FR-007a**: System MUST automatically generate a unique username based on the email prefix (part before @).
- **FR-007b**: Username constraints: 3-30 chars, lowercase alphanumeric + underscore, must start with letter, no consecutive underscores.
- **FR-007c**: System MUST normalize username: lowercase, replace dots/hyphens with underscore, remove invalid characters.
- **FR-007d**: System MUST ensure username uniqueness by appending sequential numeric suffix (_1, _2, ...) if collision detected.
- **FR-008**: System MUST create an AuthIdentity record with provider=LOCAL, providerUserId=email, and hashed password.
- **FR-009**: System MUST perform user, tenant, and auth-identity creation as a single atomic transaction.
- **FR-010**: System MUST return a success response containing: success message, userId, email, and tenantId (excluding sensitive data like password hash).
- **FR-010a**: System MUST NOT auto-login users after registration; users must authenticate separately via the login endpoint.
- **FR-011**: System MUST return appropriate error responses with HTTP status codes (400 for validation, 409 for duplicate email).
- **FR-012**: System MUST log registration attempts (success and failure) for security auditing.

### Key Entities

- **Tenant**: Represents a workspace/organization. Created automatically during registration with default plan (FREE) and status (ACTIVE). One tenant has many users.

- **User**: Represents a human user account. Created during registration and linked to the auto-created tenant. Assigned ADMIN role as tenant owner. Username is auto-generated from email prefix with random suffix for uniqueness.

- **AuthIdentity**: Represents a login method. For LOCAL registration: provider=LOCAL, providerUserId=email, passwordHash=securely hashed password. One user can have multiple auth identities (for future OAuth support).

- **Session**: Created after registration to manage the user's login session with tokens, device info, and expiration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the registration process in under 30 seconds from form submission to receiving success confirmation.
- **SC-002**: System correctly rejects 100% of duplicate email registration attempts for the same provider.
- **SC-003**: 100% of validation errors provide user-friendly messages indicating exactly what needs to be corrected.
- **SC-004**: System supports at least 100 concurrent registration requests without failures or degradation.
- **SC-005**: 95% of first-time users successfully complete registration without needing support assistance.
- **SC-006**: Zero plain-text passwords are ever stored or logged in the system.

## Assumptions

- Password policy (8+ chars, mixed case, number) is an industry-standard default.
- Default tenant plan is FREE; upgrades handled separately.
- Email verification is not in scope for this feature (can be added as separate feature).
- Rate limiting for registration is handled at infrastructure level.
- The API endpoint follows RESTful conventions at `POST /auth/register`.
