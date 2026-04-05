# Authentication API

> REST API endpoints for user registration, login, and session management.

**Base URL:** `/api/v1/auth`
**Authentication:** Public (no JWT required for register/login/refresh)

---

## 1. POST `/register`

Register a new user account. Creates user, auth identity, and default personal workspace.

### Request

```json
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd!",
  "name": "John Doe",
  "tenantName": "My Workspace"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | Yes | Valid email format | User's email address |
| `password` | string | Yes | Min 8 chars, strong | Must pass `IsPasswordStrong` validator |
| `name` | string | Yes | Non-empty | Display name |
| `tenantName` | string | No | — | Initial workspace name (defaults to "Personal Workspace") |

### Response

**201 Created**

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "tenantId": "uuid"
    },
    "accessToken": {
      "token": "eyJhbGci...",
      "expiresIn": 900
    }
  }
}
```

### Error Cases

| Status | Code | Condition |
|--------|------|----------|
| `400` | `VALIDATION_ERROR` | Invalid email, weak password |
| `409` | `EMAIL_ALREADY_EXISTS` | Email already registered |

---

## 2. POST `/login`

Authenticate user and issue access + refresh tokens.

### Request

```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd!"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | Yes | Valid email | User's email |
| `password` | string | Yes | Min 8 chars | User's password |

### Response

**200 OK**

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "tenantId": "uuid"
    },
    "accessToken": {
      "token": "eyJhbGci...",
      "expiresIn": 900
    }
  }
}
```

**Side effect:** Sets `refreshToken` in HttpOnly cookie.

### Error Cases

| Status | Code | Condition |
|--------|------|----------|
| `400` | `VALIDATION_ERROR` | Invalid input |
| `401` | `INVALID_CREDENTIALS` | Wrong email or password |
| `429` | `TOO_MANY_REQUESTS` | Rate limit exceeded |

---

## 3. POST `/refresh`

Refresh access token using the HttpOnly refresh token cookie.

### Request

```json
POST /api/v1/auth/refresh
Cookie: refreshToken=...
```

No body required — refresh token is read from the HttpOnly cookie set during login.

### Response

**200 OK**

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "tenantId": "uuid"
    },
    "accessToken": {
      "token": "eyJhbGci...",
      "expiresIn": 900
    }
  }
}
```

**Side effect:** Issues a new refresh token cookie.

### Error Cases

| Status | Code | Condition |
|--------|------|----------|
| `401` | `INVALID_REFRESH_TOKEN` | Missing or invalid refresh token |
| `401` | `SESSION_EXPIRED` | Refresh token has expired |

---

## 4. JWT Token Response

Both register and login return the same token structure:

```typescript
interface TokenResultDto {
  token: string;      // JWT access token
  expiresIn: number; // Seconds until expiry (900 = 15 min)
}

interface UserResponseDto {
  id: string;         // User UUID
  email: string;      // User email
  tenantId: string;  // Current active workspace UUID
}
```

---

## 5. JWT Payload Structure

Once decoded, the access token contains:

```json
{
  "sub": "user-uuid",
  "tenantId": "workspace-uuid",
  "sessionId": "session-uuid",
  "role": "owner",
  "workspaces": ["workspace-uuid-1", "workspace-uuid-2"],
  "email": "user@example.com",
  "iat": 1710000000,
  "exp": 1710000900
}
```

| Claim | Description |
|-------|-------------|
| `sub` | User ID |
| `tenantId` | Current active workspace (for tenant isolation) |
| `sessionId` | Active session ID |
| `role` | Role in current workspace |
| `workspaces` | All workspaces the user belongs to |
| `exp` | Expiration (15 min from issuance) |
| `iat` | Issued at |

---

## 6. Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be an email"
    }
  ]
}
```
