# Auth Module — Domain Reference

> Handles authentication, identity, and session management.

---

## 1. Overview

The auth module manages user identity, authentication credentials, and active sessions. It is the only module with no internal dependencies on other bounded contexts — it operates independently.

---

## 2. Entities

### 2.1 `User` (Aggregate Root)

The primary user identity — a single person who may belong to multiple workspaces.

```typescript
// File: server/src/modules/auth/domain/entities/user.entity.ts
import { AggregateRoot } from '@core/ddd';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface UserProps {
  tenantId: string;       // Primary tenant
  email: Email;           // Email value object (validated)
  username: Username;     // Username value object
  name: string;
  role: UserRole;
}

export class User extends AggregateRoot {
  public tenantId: string;
  public email: Email;
  public username: Username;
  public name: string;
  public role: UserRole;
  // _id (uuid) inherited from Entity base
  // createdAt, updatedAt inherited from Entity base
}
```

**Domain Methods:**
```typescript
static create(props: Omit<UserProps, 'role'> & { role?: UserRole }): User
static rehydrate(props: CreateEntityProps<UserProps>): User
```

**Events Emitted:**
- `UserRegisteredEvent` — fired on creation with `userId`, `email`, `tenantId`, `name`

---

### 2.2 `AuthIdentity` (Aggregate Root)

Credentials linked to a user account. Supports multiple providers (LOCAL, GOOGLE).

```typescript
// File: server/src/modules/auth/domain/entities/auth-identity.entity.ts

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export interface AuthIdentityProps {
  userId: string;              // FK → User._id
  provider: AuthProvider;
  providerUserId: string;      // email for LOCAL, sub for GOOGLE
  password?: Password;         // Value object, only for LOCAL provider
}

export class AuthIdentity extends AggregateRoot {
  public userId: string;
  public provider: AuthProvider;
  public providerUserId: string;
  public password?: Password;
  // _id (uuid) inherited from Entity base
}
```

**Domain Methods:**
```typescript
static create(props: AuthIdentityProps): AuthIdentity
static rehydrate(props: CreateEntityProps<AuthIdentityProps>): AuthIdentity
async verifyPassword(plainText: string, hasher: IPasswordHasher): Promise<boolean>
```

**Events Emitted:**
- `AuthIdentityCreatedEvent` — fired on creation with `authIdentityId`, `userId`, `provider`

---

### 2.3 `Session` (Aggregate Root)

Represents an active user session. Tracks validity, expiration, and revocation state.

```typescript
// File: server/src/modules/auth/domain/entities/session.entity.ts

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export interface SessionProps {
  tenantId: string;
  userId: string;                 // FK → User._id
  authIdentityId?: string;         // FK → AuthIdentity._id
  refreshTokenHash?: string;       // bcrypt hash of refresh token
  status: SessionStatus;
  expiresAt: Date;                // Expiration timestamp
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class Session extends AggregateRoot {
  public tenantId: string;
  public userId: string;
  public authIdentityId?: string;
  public refreshTokenHash?: string;
  public status: SessionStatus;
  public expiresAt: Date;
  public deviceId?: string;
  public ipAddress?: string;
  public userAgent?: string;
  // _id (uuid) inherited from Entity base
}
```

**Domain Methods:**
```typescript
static create(props: Omit<SessionProps, 'status'> & { status?: SessionStatus }): Session
static rehydrate(props: CreateEntityProps<SessionProps>): Session
setRefreshTokenHash(refreshTokenHash: string): void
isExpired(): boolean
isRevoked(): boolean
isValid(): boolean        // status === ACTIVE && !isExpired()
revoke(): void
```

**Events Emitted:**
- `SessionCreatedEvent` — fired on creation with `sessionId`, `userId`, `tenantId`, `expiresAt`

---

## 3. Domain Events

| Event | Trigger | Key Payload |
|-------|---------|-------------|
| `UserRegisteredEvent` | `User.create()` | `userId`, `email`, `tenantId`, `name` |
| `AuthIdentityCreatedEvent` | `AuthIdentity.create()` | `authIdentityId`, `userId`, `provider` |
| `SessionCreatedEvent` | `Session.create()` | `sessionId`, `userId`, `tenantId`, `expiresAt` |
| `LoginSucceededEvent` | Login success | `userId`, `sessionId`, `provider` |
| `TenantCreatedEvent` | Tenant workspace creation | `tenantId`, `userId` |

---

## 4. Commands

| Command | Handler | Purpose |
|---------|---------|---------|
| `RegisterCommand` | `RegisterCommandHandler` | Create user + auth identity + default workspace |
| `LoginCommand` | `LoginCommandHandler` | Validate credentials, create session, issue tokens |
| `RefreshCommand` | `RefreshCommandHandler` | Validate refresh token, issue new access token |

### `RegisterCommand`

```typescript
// File: server/src/modules/auth/application/commands/register.command.ts
export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
    public readonly username: string,
    public readonly ipAddress: string,
    public readonly userAgent: string,
  ) {}
}
```

### `LoginCommand`

```typescript
// File: server/src/modules/auth/application/commands/login.command.ts
export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly ipAddress: string,
    public readonly userAgent: string,
    public readonly deviceId?: string,
  ) {}
}
```

### `RefreshCommand`

```typescript
// File: server/src/modules/auth/application/commands/refresh.command.ts
export class RefreshCommand {
  constructor(
    public readonly refreshToken: string,  // From HttpOnly cookie
  ) {}
}
```

---

## 5. Queries

| Query | Handler | Purpose |
|-------|---------|---------|
| `GetSessionQuery` | `GetSessionQueryHandler` | Retrieve active session by ID |
| `ValidateSessionQuery` | `ValidateSessionQueryHandler` | Check if a session is still valid |

---

## 6. Authentication Flow

```
Client                    Auth Module                    Persistence
  │                             │                              │
  │  POST /api/v1/auth/register │                              │
  │ ──────────────────────────► │                              │
  │                             │  RegisterCommand              │
  │                             │  ─► Create User              │
  │                             │  ─► Create AuthIdentity       │
  │                             │  ─► Create Tenant             │
  │                             │  ─► Create Session            │
  │                             │                              │
  │  201: { user, accessToken }│                              │
  │ ◄──────────────────────────── │                              │
  │                             │                              │
  │  POST /api/v1/auth/login  │                              │
  │ ──────────────────────────► │                              │
  │                             │  LoginCommand                 │
  │                             │  ─► Verify password (bcrypt)  │
  │                             │  ─► Create Session           │
  │                             │  ─► Emit LoginSucceededEvent  │
  │                             │                              │
  │  200: { user, accessToken }│                              │
  │  Set-Cookie: refreshToken  │                              │
  │ ◄──────────────────────────── │                              │
```

---

## 7. JWT Token Structure

```typescript
interface ITokenPayload {
  userId: string;
  tenantId: string;              // Current active workspace/tenant
  sessionId: string;
  role: 'owner' | 'admin' | 'member';
  workspaces: string[];          // All workspaces the user belongs to
  email: string;
  exp: number;                   // Expiration timestamp
  iat: number;                   // Issued at
}
```

Access token TTL: **15 minutes**
Refresh token TTL: **7 days** (HttpOnly cookie)
