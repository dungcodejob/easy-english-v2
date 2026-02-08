# Quickstart Guide: Local Authentication Login Flow

**Feature**: Local Authentication Login Flow  
**Date**: 2026-02-04  
**Plan**: [plan.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/plan.md)

---

## Overview

This guide provides step-by-step instructions to implement and test the Local Authentication Login Flow feature. Follow this guide to set up the backend API, frontend components, and verify the complete authentication flow.

---

## Prerequisites

### Backend
- Node.js 18+ installed
- PostgreSQL 14+ running
- NestJS CLI installed: `npm install -g @nestjs/cli`

### Frontend
- Node.js 18+ installed
- npm or yarn package manager

### Environment Variables

Create or update `.env` files in both backend and frontend:

**Backend** (`server/.env`):
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/easy_english_v2

# JWT Configuration
JWT_SECRET_KEY_PATH=./keys/private-key.pem
JWT_PUBLIC_KEY_PATH=./keys/public-key.pem
JWT_ACCESS_TOKEN_EXPIRATION=7d
JWT_REFRESH_TOKEN_EXPIRATION=30d
JWT_ISSUER=easy-english-v2
JWT_AUDIENCE=easy-english-client

# Password Hashing (Argon2)
ARGON2_MEMORY_COST=19456
ARGON2_TIME_COST=2
ARGON2_PARALLELISM=1

# Rate Limiting
RATE_LIMIT_LOGIN_PER_MINUTE=10
RATE_LIMIT_LOGIN_PER_HOUR=50

# Login Attempt Tracking
LOGIN_LOCKOUT_THRESHOLD_SOFT=5
LOGIN_LOCKOUT_DURATION_SOFT=15
LOGIN_LOCKOUT_THRESHOLD_HARD=10
LOGIN_LOCKOUT_DURATION_HARD=60
LOGIN_FLAG_THRESHOLD=20

# Session Cleanup
SESSION_CLEANUP_SCHEDULE="0 2 * * *"
SESSION_RETENTION_DAYS=90

# Cookie Configuration
FRONTEND_URL=http://localhost:5173
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false  # true in production (HTTPS only)
```

**Frontend** (`client/.env`):
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd server
npm install @node-rs/argon2 @nestjs/jwt @nestjs/passport passport-jwt @nestjs/schedule
```

### Step 2: Generate JWT Keys

Generate RSA key pair for JWT signing:

```bash
# Create keys directory
mkdir -p keys

# Generate private key
openssl genpkey -algorithm RSA -out keys/private-key.pem -pkeyopt rsa_keygen_bits:2048

# Extract public key
openssl rsa -pubout -in keys/private-key.pem -out keys/public-key.pem
```

### Step 3: Run Database Migrations

```bash
# Create migration files
npm run migration:create -- CreateAuthLoginTables

# Apply migrations
npm run migration:run
```

Migration script content (see [data-model.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/data-model.md) for full schema):
```sql
-- Create auth_identities table
CREATE TABLE auth_identities (...);

-- Create sessions table
CREATE TABLE sessions (...);

-- Create login_attempt_trackers table
CREATE TABLE login_attempt_trackers (...);
```

### Step 4: Implement Auth Module

Follow the structure in [plan.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/plan.md):

1. Create domain entities:
   - `server/src/modules/auth/domain/entities/auth-identity.entity.ts`
   - `server/src/modules/auth/domain/entities/session.entity.ts`
   - `server/src/modules/auth/domain/entities/login-attempt-tracker.entity.ts`

2. Implement repositories (interfaces + implementations)

3. Create application layer:
   - `LoginCommand` + `LoginCommandHandler`
   - `GetSessionQuery` + `GetSessionQueryHandler`

4. Implement infrastructure services:
   - `TokenGeneratorService`
   - `PasswordHasherService`

5. Create DTOs and controller:
   - `LoginRequestDto`
   - `LoginResponseDto`
   - `AuthController`

### Step 5: Register Auth Module

Update `server/src/app.module.ts`:
```typescript
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // ... other modules
    AuthModule,
  ],
})
export class AppModule {}
```

### Step 6: Start Backend

```bash
cd server
npm run start:dev
```

Verify server is running:
```bash
curl http://localhost:3000/api/health
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd client
npm install @tanstack/react-query axios
```

### Step 2: Create Auth Module

Follow the structure in [plan.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/plan.md):

1. Create types:
   - `client/src/modules/auth/types/auth.types.ts`

2. Create API service:
   - `client/src/modules/auth/services/auth.api.ts`

3. Create TanStack Query hooks:
   - `client/src/modules/auth/hooks/use-login.ts`

4. Create UI components:
   - `client/src/modules/auth/components/login-form.tsx`
   - `client/src/modules/auth/pages/login-page.tsx`

5. Create auth context:
   - `client/src/shared/contexts/auth-context.tsx`

### Step 3: Configure API Client

Update `client/src/shared/api/axios-instance.ts` for cookie-based auth:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // CRITICAL: Include cookies in cross-origin requests
});

// No need to manually add auth headers - cookies are sent automatically!

// Handle 401 errors (redirect to login)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Cookies will be cleared by server on logout
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Important**: Tokens are now stored in **HttpOnly cookies** by the backend. Frontend code cannot and should not access them directly. The `withCredentials: true` option ensures cookies are automatically sent with every request.

### Step 4: Setup Routes

Update `client/src/main.tsx` or routing configuration:

```typescript
import { Route } from '@tanstack/react-router';
import { LoginPage } from './modules/auth/pages/login-page';
import { ProtectedRoute } from './shared/components/protected-route';

const routes = [
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/',
    component: ProtectedRoute,
    children: [
      // Protected routes here
    ],
  },
];
```

### Step 5: Start Frontend

```bash
cd client
npm run dev
```

Frontend should be accessible at `http://localhost:5173`

---

## Testing

### Backend Tests

#### Unit Tests (Domain Layer)

```bash
cd server

# Test AuthIdentity password verification
npm run test -- src/modules/auth/domain/entities/auth-identity.entity.spec.ts

# Test Session creation and validation
npm run test -- src/modules/auth/domain/entities/session.entity.spec.ts

# Test LoginAttemptTracker lockout logic
npm run test -- src/modules/auth/domain/entities/login-attempt-tracker.entity.spec.ts
```

#### Integration Tests (API)

```bash
# Test full login flow
npm run test:e2e -- test/auth/login.e2e-spec.ts
```

### Frontend Tests

```bash
cd client

# Test login form component
npm run test -- src/modules/auth/components/login-form.test.tsx

# Test useLogin hook
npm run test -- src/modules/auth/hooks/use-login.test.ts
```

### Manual Testing

#### Scenario 1: Successful Login

1. Navigate to `http://localhost:5173/login`
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login" button
4. **Expected**: Redirect to dashboard, tokens stored in HttpOnly cookies

**Verify**:
```bash
# Check cookies in browser DevTools (Application tab → Cookies)
# Should see:
# - accessToken (HttpOnly, Secure in prod, SameSite=Strict)
# - refreshToken (HttpOnly, Secure in prod, SameSite=Strict, Path=/api/v1/auth/refresh)

# Check network tab for API call
# POST http://localhost:3000/api/v1/auth/login
# Status: 200
# Response Headers should include:
# Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict; ...
# Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; ...

# Response body should NOT contain tokens (security best practice):
# { success: true, data: { user: {...}, expiresAt: "...", refreshExpiresAt: "..." } }
```

#### Scenario 2: Invalid Credentials

1. Navigate to `http://localhost:5173/login`
2. Enter invalid credentials:
   - Email: `test@example.com`
   - Password: `wrongpassword`
3. Click "Login" button
4. **Expected**: Error message "Invalid email or password"

**Verify**:
```bash
# Check network tab
# POST http://localhost:3000/api/v1/auth/login
# Status: 401
# Response: { success: false, error: { code: 'ERR_INVALID_CREDENTIALS', ... } }
```

#### Scenario 3: Rate Limiting

1. Attempt to login with wrong password 5 times
2. On 6th attempt, should see lockout message
3. **Expected**: "Too many failed login attempts. Please try again in 15 minutes."

**Verify**:
```bash
# Check database for LoginAttemptTracker record
SELECT * FROM login_attempt_trackers WHERE identifier = 'test@example.com';

# Should show:
# - attempt_count: 5+
# - lock_expires_at: NOT NULL
```

#### Scenario 4: Session Limit Enforcement

1. Open 5 different browsers (or incognito windows)
2. Log in with the same user in all 5 browsers
3. Verify all 5 have valid sessions
4. Open a 6th browser and log in
5. **Expected**: 6th login succeeds, oldest session is revoked

**Verify**:
```bash
# Check database for active sessions
SELECT * FROM sessions WHERE user_id = '<user-id>' AND status = 'ACTIVE' ORDER BY created_at DESC;

# Should show only 5 active sessions
```

---

## API Testing with cURL

### Login Request (with cookie support)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response Headers**:
```http
Set-Cookie: accessToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=2592000
```

**Expected Response Body** (tokens NOT in body, only in cookies):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "test@example.com"
    },
    "expiresAt": "2026-02-11T00:51:34Z",
    "refreshExpiresAt": "2026-03-06T00:51:34Z"
  },
  "timestamp": "2026-02-04T00:51:34Z"
}
```

### Using Cookies for Authenticated Requests

```bash
# Use saved cookies from login
curl -X GET http://localhost:3000/api/v1/protected-endpoint \
  -b cookies.txt

# Cookie is automatically sent, no need for Authorization header
```

---

## Troubleshooting

### Issue: "JWT malformed" error

**Cause**: Invalid JWT secret or keys not found  
**Solution**: Verify JWT keys exist in `server/keys/` and paths in `.env` are correct

### Issue: "Database connection error"

**Cause**: PostgreSQL not running or wrong credentials  
**Solution**: 
```bash
# Check PostgreSQL status
pg_isready

# Verify DATABASE_URL in server/.env
```

### Issue: "Password hashing too slow"

**Cause**: Argon2 memory cost too high  
**Solution**: Reduce `ARGON2_MEMORY_COST` in `.env` (development only, keep high in production)

### Issue: Rate limiting triggers too quickly

**Cause**: Development environment with frequent testing  
**Solution**: Temporarily increase limits in `.env`:
```bash
RATE_LIMIT_LOGIN_PER_MINUTE=100
LOGIN_LOCKOUT_THRESHOLD_SOFT=20
```

---

## Next Steps

1. **Implement Logout**: Add `POST /api/v1/auth/logout` endpoint (revoke current session)
2. **Implement Token Refresh**: Add `POST /api/v1/auth/refresh` endpoint (rotate refresh token)
3. **Add Session Management UI**: List and revoke active sessions
4. **Implement "Remember Me"**: Extend refresh token lifetime based on user preference
5. **Add OAuth Providers**: Extend AuthIdentity to support Google, GitHub, etc.

---

## Resources

- [Plan Document](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/plan.md)
- [Research Document](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/research.md)
- [Data Model](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/data-model.md)
- [API Contract (OpenAPI)](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/contracts/login-api.yaml)
- [Feature Specification](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/spec.md)

---

**Status**: Ready for Phase 2 - Task Generation (`/speckit.tasks`)
