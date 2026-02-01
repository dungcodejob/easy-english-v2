# Quickstart: Local Auth Register

**Feature**: 1-local-auth-register  
**Date**: 2026-02-01

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running
- Backend server running (`npm run dev` in `/server`)
- Frontend dev server running (`npm run dev` in `/client`)

---

## Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### 2. Create Module Structure

```bash
# Create auth module directories
mkdir -p src/modules/auth/{controllers,application/{commands,queries},domain/{entities,value-objects,services,repositories},infrastructure/{persistence,repositories},dto/{requests,responses}}
```

### 3. Run Migrations

```bash
# Generate migration for new entities
npm run migration:create -- --name=create-auth-entities

# Run migrations
npm run migration:run
```

### 4. Verify Backend

```bash
# Start dev server
npm run dev

# Test endpoint (should return 400 validation error)
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Frontend Setup

### 1. Create Module Structure

```bash
cd client

# Create auth module directories
mkdir -p src/modules/auth/{components,pages,hooks,services,types,utils}
```

### 2. Add Route

Add to `src/routes.ts`:
```typescript
route('/register', 'modules/auth/pages/register.page.tsx')
```

### 3. Verify Frontend

```bash
npm run dev
# Navigate to http://localhost:3000/register
```

---

## API Testing

### Successful Registration

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User"
  }'
```

Expected response (201):
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "test@example.com",
    "tenantId": "..."
  },
  "correlationId": "..."
}
```

### Validation Error

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "weak",
    "name": ""
  }'
```

Expected response (400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "type": "client",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Must be a valid email address", "code": "INVALID_FORMAT" },
      { "field": "password", "message": "Must be at least 8 characters", "code": "TOO_SHORT" },
      { "field": "name", "message": "Name is required", "code": "REQUIRED" }
    ]
  },
  "correlationId": "..."
}
```

### Duplicate Email Error

```bash
# Register same email twice
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User 2"
  }'
```

Expected response (409):
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "type": "domain",
    "message": "A user with this email already exists"
  },
  "correlationId": "..."
}
```

---

## Database Verification

After successful registration, verify in PostgreSQL:

```sql
-- Check tenant was created
SELECT * FROM tenants ORDER BY created_at DESC LIMIT 1;

-- Check user was created
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;

-- Check auth identity was created
SELECT id, user_id, provider, provider_user_id, 
       LEFT(password_hash, 10) || '...' as password_hash_preview
FROM auth_identities 
ORDER BY created_at DESC LIMIT 1;

-- Verify password is hashed (should start with $2b$12$)
SELECT password_hash FROM auth_identities 
WHERE provider_user_id = 'test@example.com';
```

---

## Next Steps

After registration is working:
1. Implement `/auth/login` endpoint
2. Implement JWT token generation
3. Add protected routes
4. Add email verification (optional, separate feature)
