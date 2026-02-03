# Research: Local Authentication Login Flow

**Feature**: Local Authentication Login Flow  
**Date**: 2026-02-04  
**Plan**: [plan.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/002-local-auth-login/plan.md)

---

## Research Tasks

This document resolves all "NEEDS CLARIFICATION" items and open questions from the implementation plan.

---

## 1. Password Hashing Algorithm: bcrypt vs argon2

### Decision
**Use `@node-rs/argon2`** for password hashing.

### Rationale

| Criterion | bcrypt | argon2 | Winner |
|-----------|--------|--------|--------|
| **Security** | Industry standard, proven | Modern, won PHC (2015), memory-hard | argon2 ✅ |
| **Performance** | CPU-bound only | CPU + memory-bound (resists ASIC/GPU attacks) | argon2 ✅ |
| **Node.js Support** | `bcrypt` (native) or `bcryptjs` (pure JS) | `@node-rs/argon2` (Rust-based, fast) | argon2 ✅ |
| **Configuration** | Cost factor (rounds) | Multiple parameters (memory, iterations, parallelism) | argon2 (more control) |
| **Adoption** | Very widespread | Growing adoption (OWASP recommendation) | tie |
| **NestJS Integration** | Easy (`@nestjs/passport`) | Easy (same, just different lib) | tie |

**Argon2 Configuration** (OWASP recommendations):
```typescript
{
  type: argon2id,        // Hybrid mode (best of argon2i + argon2d)
  memoryCost: 19456,     // 19 MiB
  timeCost: 2,           // 2 iterations
  parallelism: 1         // Single-threaded (suitable for auth)
}
```

**Installation**:
```bash
npm install @node-rs/argon2
```

### Alternatives Considered

- **bcrypt**: More established but less resistant to hardware attacks. Good choice, but argon2 is newer and stronger.
- **scrypt**: Another memory-hard function, but less standardized than argon2.
- **PBKDF2**: Older, not memory-hard, not recommended for new projects.

### Implementation Notes

- Create `PasswordHasherService` in `infrastructure/services/`
- Wrapper interface in domain layer to keep domain independent
- Make algorithm configurable via environment variable for future flexibility

**References**:
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Argon2 RFC 9106](https://datatracker.ietf.org/doc/html/rfc9106)
- [@node-rs/argon2 docs](https://github.com/napi-rs/node-rs)

---

## 2. Refresh Token Strategy: One-Time-Use vs Reusable

### Decision
**Implement one-time-use (rotating) refresh tokens**.

###Rationale

**Specification Requirement**: The spec explicitly states in BR-007 and Session invariant that "refresh tokens are one-time-use."

**Security Benefits**:
1. **Theft Detection**: If a refresh token is reused, it indicates token theft → system can revoke all sessions for that user
2. **Limited Exposure Window**: Each token is valid for only one refresh operation
3. **Industry Best Practice**: OAuth 2.0 Security Best Current Practice (BCP) recommends token rotation

**Implementation Approach**:
```text
Client sends: POST /api/v1/auth/refresh { refreshToken }
Server responds:
  1. Validate refreshToken hash against Session.refreshTokenHash
  2. If valid but already used → SECURITY ALERT (possible theft)
  3. If valid and not used → Generate NEW tokens (access + refresh)
  4. Update Session.refreshTokenHash with new refresh token hash
  5. Mark old refreshToken as used
  6. Return new tokens to client
```

**Trade-offs**:
- ✅ Pro: Better security posture
- ✅ Pro: Detects stolen tokens
- ⚠️ Con: Slightly more complex implementation (need to track "used" state)
- ⚠️ Con: Network issues during refresh can cause token invalidation (mitigated with retry logic)

**Mitigation for Network Issues**:
- Short grace period (30 seconds) where old refresh token remains valid
- After new tokens issued, old token can still be used once more if retry within grace period
- After grace period or second use → security alert

### Alternatives Considered

- **Reusable Refresh Tokens**: Simpler implementation, but less secure. Rejected due to spec requirement and security concerns.
- **Sliding Expiration**: Refresh token lifetime extends on each use. Rejected because it doesn't align with one-time-use requirement.

**References**:
- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [RFC 6819: OAuth 2.0 Threat Model](https://datatracker.ietf.org/doc/html/rfc6819)

---

## 3. Expired Session Cleanup Strategy

### Decision
**Implement a scheduled background job that runs daily to clean up expired sessions**.

### Rationale

**Soft vs Hard Deletion**:
- Use **soft deletion** (mark `Session.status = 'EXPIRED'`) to preserve audit trail
- Hard delete only after retention period (e.g., 90 days) for compliance

**Cleanup Approach**:
```text
Every day at 2:00 AM UTC:
  1. Find all sessions where expiresAt < NOW() AND status = 'ACTIVE'
  2. Update status to 'EXPIRED'
  3. Emit SessionExpired event (for audit logging)
  4. Find all sessions where status = 'EXPIRED' AND expiresAt < NOW() - 90 days
  5. Hard delete those sessions
```

**Implementation**:
- Use `@nestjs/schedule` for cron jobs
- Create `CleanupExpiredSessionsJob` in `auth/infrastructure/jobs/`
- Job runs independently of user requests (doesn't block API)

**Configuration** (environment variables):
```bash
SESSION_CLEANUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM UTC
SESSION_RETENTION_DAYS=90              # Keep expired sessions for 90 days
```

**Monitoring**:
- Log number of sessions cleaned up
- Alert if cleanup job fails
- Track average cleanup duration

**Performance Considerations**:
- Batch updates (process 1000 sessions at a time)
- Add database index on `(status, expiresAt)` for efficient queries

### Alternatives Considered

- **Lazy Deletion (on access)**: Delete expired sessions when user tries to use them. Rejected because it doesn't prevent database bloating.
- **TTL at Database Level**: PostgreSQL doesn't have native TTL. Would need extension or triggers. Rejected for complexity.
- **Real-time Expiration**: Check and expire on every request. Rejected due to performance overhead.

**References**:
- [NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)

---

## 4. "Remember Me" Functionality

### Decision
**OUT OF SCOPE for this feature. Implement in future iteration if needed.**

### Rationale

**Current Implementation Supports It**:
- Token expiration durations are configurable via environment variables (see NFR-008)
- Can implement "remember me" later by:
  1. Adding `rememberMe: boolean` to LoginRequestDto
  2. If `rememberMe === true`, use extended refresh token lifetime (e.g., 90 days instead of 30)
  3. No changes to database schema or domain logic required

**Why Not Now**:
- Not in the feature specification scope
- Spec states "Session management" is in scope, but no mention of "remember me"
- Can be added incrementally without refactoring

**Future Implementation Notes** (for when this is requested):
```typescript
// In LoginCommand
if (rememberMe) {
  refreshTokenExpiration = '90d';  // Extended
} else {
  refreshTokenExpiration = '30d';  // Default
}
```

**UI Consideration**:
- Add checkbox on login form: "Keep me logged in"
- Store preference in frontend (not part of session, just UI state)

---

## 5. JWT Token Structure & Claims

### Decision
**Use standard JWT with tenant-scoped claims**.

### JWT Structure

**Access Token Claims**:
```json
{
  "sub": "user-uuid",           // Subject: User ID
  "email": "user@example.com",  // User email (for convenience)
  "tenantId": "tenant-uuid",    // Tenant ID (critical for multi-tenancy)
  "sessionId": "session-uuid",  // Session ID (for revocation checks)
  "iat": 1234567890,            // Issued at
  "exp": 1234567890,            // Expiration (7 days from iat)
  "iss": "easy-english-v2",     // Issuer
  "aud": "easy-english-client"  // Audience
}
```

**Refresh Token Claims**:
```json
{
  "sub": "user-uuid",
  "sessionId": "session-uuid",  // Critical: ties refresh token to specific session
  "tenantId": "tenant-uuid",
  "iat": 1234567890,
  "exp": 1234567890,            // Expiration (30 days from iat)
  "iss": "easy-english-v2",
  "type": "refresh"             // Distinguishes from access token
}
```

**Security Considerations**:
- **DO NOT** store sensitive data in JWT (no phone numbers, addresses, etc.)
- **DO NOT** store permissions/roles in JWT (query in real-time for authorization)
- **DO** validate `tenantId` on every request (prevents tenant hopping attacks)
- **DO** validate `sessionId` exists and is active (supports session revocation)

**Signing Algorithm**: Use `RS256` (RSA with SHA-256)
- More secure than `HS256` (symmetric) for multi-tenant systems
- Public key can be distributed for token validation
- Private key stays on auth server only

**Environment Configuration**:
```bash
JWT_SECRET_KEY_PATH=/path/to/private-key.pem
JWT_PUBLIC_KEY_PATH=/path/to/public-key.pem
JWT_ACCESS_TOKEN_EXPIRATION=7d
JWT_REFRESH_TOKEN_EXPIRATION=30d
JWT_ISSUER=easy-english-v2
JWT_AUDIENCE=easy-english-client
```

### Implementation

**Token Generation Service** (`infrastructure/services/token-generator.service.ts`):
```typescript
@Injectable()
export class TokenGeneratorService {
  async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
      algorithm: 'RS256',
    });
  }

  async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
        algorithm: 'RS256',
      }
    );
  }

  async validateToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verify(token, {
      algorithms: ['RS256'],
    });
  }
}
```

**References**:
- [RFC 7519: JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [JWT Best Practices](https://curity.io/resources/learn/jwt-best-practices/)

---

## 6. Rate Limiting Strategy for Login Endpoint

### Decision
**Implement multi-layered rate limiting with both IP-based and account-based limits**.

### Strategy

**Layer 1: IP-Based Rate Limiting** (Infrastructure)
- Protect against distributed brute-force attacks
- Tools: `@nestjs/throttler` or Nginx/CloudFlare rate limiting
- Limits:
  - 10 login attempts per IP per minute
  - 50 login attempts per IP per hour

**Layer 2: Account-Based Rate Limiting** (Domain/Application)
- Protect individual accounts from targeted attacks
- Uses `LoginAttemptTracker` entity
- Limits:
  - 5 failed attempts per email per 15 minutes → temporary lockout (15 min)
  - 10 failed attempts per email per hour → extended lockout (1 hour)
  - 20 failed attempts per email per day → account flagged for review

**Implementation**:

```typescript
// In LoginCommandHandler, before password verification:
const attempts = await this.loginAttemptTrackerRepo.findByEmail(email);

if (attempts && attempts.isLocked()) {
  throw new AccountTemporarilyLockedException(
    `Too many failed attempts. Try again in ${attempts.getRemainingLockTime()} minutes.`
  );
}

// After failed login:
await this.loginAttemptTrackerRepo.recordFailedAttempt(email, ipAddress);

// After successful login:
await this.loginAttemptTrackerRepo.clearAttempts(email);
```

**LoginAttemptTracker Entity Methods**:
```typescript
class LoginAttemptTracker extends Entity {
  isLocked(): boolean {
    return this.lockExpiresAt && this.lockExpiresAt > new Date();
  }

  getRemainingLockTime(): number {
    if (!this.isLocked()) return 0;
    return Math.ceil((this.lockExpiresAt.getTime() - Date.now()) / 60000);
  }

  recordFailedAttempt(): void {
    this.attemptCount++;
    this.lastAttemptAt = new Date();

    if (this.attemptCount >= 20) {
      // Flag for review
      this.flaggedForReview = true;
    } else if (this.attemptCount >= 10) {
      // 1 hour lockout
      this.lockExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    } else if (this.attemptCount >= 5) {
      // 15 minute lockout
      this.lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    }
  }
}
```

**Configuration**:
```bash
# IP-based (Throttler)
RATE_LIMIT_LOGIN_PER_MINUTE=10
RATE_LIMIT_LOGIN_PER_HOUR=50

# Account-based (LoginAttemptTracker)
LOGIN_LOCKOUT_THRESHOLD_SOFT=5      # Failed attempts before soft lock
LOGIN_LOCKOUT_DURATION_SOFT=15      # Minutes
LOGIN_LOCKOUT_THRESHOLD_HARD=10     # Failed attempts before hard lock
LOGIN_LOCKOUT_DURATION_HARD=60      # Minutes
LOGIN_FLAG_THRESHOLD=20             # Failed attempts before flagging account
```

**Monitoring & Alerts**:
- Alert security team when account is flagged for review
- Dashboard showing accounts with high failed attempt counts
- Metrics: failed login rate per minute/hour

### Alternatives Considered

- **IP-Only**: Insufficient for targeted attacks on specific accounts. Rejected.
- **CAPTCHA after N attempts**: Good addition, but requires frontend work. Can be added later.
- **Account Lockout Only**: Leaves system vulnerable to distributed attacks. Rejected.

**References**:
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NestJS Throttler](https://docs.nestjs.com/security/rate-limiting)

---

## Summary

All open questions have been resolved with concrete decisions:

| Question | Decision | Impact |
|----------|----------|--------|
| Password hashing algorithm | **argon2id** (`@node-rs/argon2`) | High - Security foundation |
| Refresh token strategy | **One-time-use (rotating)** | High - Security & compliance |
| Session cleanup | **Daily background job** | Medium - Database maintenance |
| "Remember me" | **Out of scope** (future) | Low - Can add incrementally |
| JWT structure | **RS256 with tenant-scoped claims** | High - Security & multi-tenancy |
| Rate limiting | **Multi-layered (IP + account)** | High - Attack prevention |

All decisions align with the constitution (§4 Security, §3 Multi-Tenancy) and the feature specification (BR-001 through BR-009, NFR-001 through NFR-008).

**Next Phase**: Proceed to Phase 1 (Design artifacts: `data-model.md`, `contracts/`, `quickstart.md`)
