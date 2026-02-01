# Research: Local Auth Register

**Feature**: 1-local-auth-register  
**Date**: 2026-02-01

---

## Password Hashing Algorithm

### Decision
**bcrypt with cost factor 12**

### Rationale
- Industry-standard for password hashing
- Built-in salt generation
- Configurable cost factor allows increasing difficulty over time
- Well-audited and battle-tested
- NestJS ecosystem has excellent support via `bcrypt` or `bcryptjs` packages

### Alternatives Considered

| Algorithm | Pros | Cons | Decision |
|-----------|------|------|----------|
| **bcrypt** | Industry standard, well-supported | CPU-bound only | ✅ Selected |
| Argon2id | Memory-hard, OWASP recommended | More complex setup, less ecosystem support | Considered for future |
| PBKDF2 | NIST approved | Less resistant to GPU attacks | Rejected |
| scrypt | Memory-hard | Less common in Node.js ecosystem | Rejected |

### Implementation Notes
- Use `bcrypt` npm package (native) or `bcryptjs` (pure JS)
- Cost factor 12 provides ~250ms hash time on modern hardware
- Store only the hash output (includes salt and cost metadata)

---

## Username Generation Strategy

### Decision
**Email prefix + random 4-character alphanumeric suffix**

### Rationale
- Recognizable to user (based on their email)
- Guaranteed unique via suffix
- No user input required during registration
- Can be changed later if needed (future feature)

### Algorithm
```
1. Extract email prefix (before @)
2. Sanitize: keep only [a-z0-9._], lowercase
3. Truncate to max 45 characters (leaving room for suffix)
4. Append "_" + 4 random alphanumeric characters
5. If collision detected, regenerate suffix and retry (max 3 attempts)
```

### Examples
| Email | Generated Username |
|-------|-------------------|
| john.doe@example.com | john.doe_a1b2 |
| JANE@company.org | jane_x9y8 |
| user+tag@mail.com | usertag_m3n4 |

---

## Registration Response Content

### Decision
**Success message + basic identifiers (userId, email, tenantId)**

### Rationale
- Provides enough info for frontend to display confirmation
- Does not include sensitive data
- Does not include auth tokens (user must login separately)
- Aligns with "no auto-login" requirement

### Response Structure
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "tenantId": "uuid"
  },
  "correlationId": "req-xxx"
}
```

---

## Email Uniqueness Strategy

### Decision
**Unique per provider (LOCAL-specific check)**

### Rationale
- Allows same email to be used with different auth providers (LOCAL, GOOGLE)
- Future-proofs for OAuth integration
- AuthIdentity table enforces uniqueness on (provider, providerUserId)

### Implementation
- Before registration, query: `SELECT * FROM auth_identity WHERE provider = 'LOCAL' AND provider_user_id = ?`
- If exists, return 409 Conflict with `EMAIL_ALREADY_EXISTS` error

---

## Transaction Strategy

### Decision
**Single database transaction for User + Tenant + AuthIdentity creation**

### Rationale
- Atomic operation ensures consistency
- On any failure, all entities roll back
- Prevents orphan tenants or users

### MikroORM Implementation
```typescript
await em.transactional(async (tx) => {
  const tenant = new Tenant({ name, status: 'ACTIVE', plan: 'FREE' });
  tx.persist(tenant);
  
  const user = new User({ email, name, username, tenantId: tenant.id, role: 'ADMIN' });
  tx.persist(user);
  
  const authIdentity = new AuthIdentity({ 
    userId: user.id, 
    provider: 'LOCAL', 
    providerUserId: email, 
    passwordHash 
  });
  tx.persist(authIdentity);
});
```

---

## Security Logging Strategy

### Decision
**Log registration attempts (success/failure) with key fields**

### Fields to Log
| Field | Always | On Success | On Failure |
|-------|--------|------------|------------|
| correlationId | ✅ | ✅ | ✅ |
| email (masked) | ✅ | ✅ | ✅ |
| timestamp | ✅ | ✅ | ✅ |
| ipAddress | ✅ | ✅ | ✅ |
| userId | - | ✅ | - |
| tenantId | - | ✅ | - |
| errorCode | - | - | ✅ |
| failureReason | - | - | ✅ |

### Masking Rules
- Email: `j***@example.com` (first char + masked + domain)
- Never log passwords or password hashes

---

## Resolved: All NEEDS CLARIFICATION Items

| Item | Resolution |
|------|------------|
| Password hashing algorithm | bcrypt, cost 12 |
| Username generation | Email prefix + 4-char random suffix |
| Response content | Message + userId, email, tenantId |
| Token issuance | No tokens; user must login separately |
