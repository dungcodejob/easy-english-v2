# Research: NestJS Authentication System

**Feature**: 1-nestjs-auth  
**Date**: 2026-01-19

---

## Research Summary

This document consolidates research findings for implementing the authentication system.

---

## 1. OAuth2 Implementation Approach

### Decision: Use `simple-oauth2` with Custom OAuthClass Abstraction

**Rationale**: 
- Provides more control over the OAuth flow compared to Passport strategies
- Allows unified handling of multiple providers with consistent interface
- Easier to add new providers without new dependencies
- Works with both Express and Fastify adapters

**Alternatives Considered**:
1. **Passport.js OAuth Strategies** - Rejected because each provider requires a separate package and strategy, leading to more dependencies and less unified code
2. **Manual OAuth implementation** - Rejected due to complexity and security risks
3. **Auth0/Firebase Auth** - Rejected as it introduces external dependency and cost

**Reference**: [NestJS OAuth2.0: Adding External Providers](https://dev.to/tugascript/nestjs-authentication-with-oauth20-adding-external-providers-2kj)

---

## 2. Token Architecture

### Decision: Dual-Token System with Rotation

**Access Token**:
- Short-lived (15 minutes default)
- Sent in Authorization header as Bearer token
- Contains: `{ userId, tokenVersion, iat, exp }`
- Stateless validation via JWT signature

**Refresh Token**:
- Long-lived (7 days default)
- Stored in HTTP-only, Secure, SameSite=Strict cookie
- Contains: `{ userId, tokenVersion, sessionId, jti }`
- Hashed and stored in Session entity for validation:
  - Enables rotation (each use issues new refresh token)
  - Enables detection of token reuse (theft detection)
  - Enables per-device revocation

**Rationale**: 
- Access tokens are stateless for performance (no DB lookup per request)
- Refresh tokens are stateful for security (can be revoked, rotated, tracked)
- `tokenVersion` on User enables global invalidation (password change, etc.)

**Reference**: [NestJS OAuth2.0: Configuration and Operations - JWT Module](https://dev.to/tugascript/nestjs-authentication-with-oauth20-configuration-and-operations-41k#jwt-module)

---

## 3. User/Account Separation Pattern

### Decision: Separate User and Account Entities

**User Entity**:
- Core identity: id, name, username, email, tokenVersion
- Profile information
- Relationships: hasMany Accounts, hasMany Sessions

**Account Entity**:
- Represents one authentication method
- Fields: type (enum), providerId, email, passwordHash (if LOCAL)
- Composite unique: (type, providerId) and (type, email)

**Rationale**:
- A user can have multiple login methods (LOCAL + multiple OAuth)
- Unlinking an Account doesn't delete the User
- Account linking/unlinking is straightforward
- Each Account type can have type-specific data

**Reference**: [NestJS OAuth2.0: Adding External Providers - User Changes](https://dev.to/tugascript/nestjs-authentication-with-oauth20-adding-external-providers-2kj#user-changes)

---

## 4. Session Management

### Decision: Per-Device Sessions with Hashed Refresh Tokens

**Session Entity**:
- id, userId, refreshTokenHash, userAgent, ipAddress, lastActivityAt, revokedAt, deletedAt

**Features**:
- Multiple concurrent sessions per user (different devices)
- Each session has its own refresh token
- Session list shows device info (user agent parsing)
- Individual session revocation invalidates that device's refresh token
- "Logout from all devices" revokes all sessions
- 30-day soft-delete retention for audit trail

**Rationale**:
- Users expect to see and manage their active sessions
- Per-device tokens enable granular security control
- Hashing refresh tokens prevents DB compromise from enabling impersonation

---

## 5. Username Generation

### Decision: Slug-based Generation with Collision Handling

**Algorithm**:
1. Take user's name: "John Doe"
2. Convert to lowercase: "john doe"
3. Replace spaces/special chars with nothing: "johndoe"
4. Remove non-alphanumeric: "johndoe"
5. Check uniqueness
6. If collision: append incrementing number (johndoe1, johndoe2, ...)

**Rationale**: Simple, predictable, human-readable usernames

---

## 6. Password Hashing

### Decision: bcrypt with Cost Factor 12

**Rationale**:
- Industry standard for password hashing
- Cost factor 12 provides good security/performance balance
- `@types/bcrypt` provides TypeScript support

---

## 7. OAuth Provider Configuration

### Decision: Environment-Driven Configuration

**Structure**:
```typescript
interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  callbackUrl: string;
}
```

**Environment Variables**:
```
OAUTH_GOOGLE_CLIENT_ID=xxx
OAUTH_GOOGLE_CLIENT_SECRET=xxx
OAUTH_GITHUB_CLIENT_ID=xxx
OAUTH_GITHUB_CLIENT_SECRET=xxx
OAUTH_FACEBOOK_CLIENT_ID=xxx
OAUTH_FACEBOOK_CLIENT_SECRET=xxx
```

**Rationale**: 
- Secrets never in code
- Easy to enable/disable providers per environment
- Follows 12-factor app principles

---

## 8. Refresh Token Reuse Detection

### Decision: Revoke All Sessions on Reuse Detection

**Algorithm**:
1. On refresh request, find Session by jti (tokenId)
2. Compare incoming token hash with stored hash
3. If no match (token already rotated) → **REUSE DETECTED**
4. On reuse: Revoke ALL sessions for that User
5. Return 401 with specific error code
6. Log security event

**Rationale**:
- If a rotated token is reused, it means either the legitimate user or an attacker has the old token
- Safest response is to invalidate all sessions, forcing re-authentication
- This is the recommended approach from OWASP

---

## 9. OAuth Profile Normalization

### Decision: Normalize to Common Profile Interface

**Interface**:
```typescript
interface OAuthProfile {
  providerId: string;    // Provider's unique user ID
  email: string;         // User's email from provider
  name: string;          // Display name
  avatarUrl?: string;    // Profile picture URL
}
```

**Provider Mappings**:
- Google: `sub` → providerId, `email`, `name`, `picture` → avatarUrl
- GitHub: `id` → providerId, `email`, `name`, `avatar_url`  
- Facebook: `id` → providerId, `email`, `name`, (picture requires separate request)

**Rationale**: Consistent handling regardless of provider response format

---

## 10. Rate Limiting for Auth Endpoints

### Decision: Apply Strict Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 attempts | 1 minute |
| `/auth/register` | 3 attempts | 10 minutes |
| `/auth/refresh` | 30 requests | 1 minute |
| `/auth/oauth/*` | 10 requests | 1 minute |

**Rationale**: Prevent brute force attacks while allowing legitimate use

---

## Dependencies

### Required New Packages

```json
{
  "@nestjs/jwt": "^10.x",
  "@nestjs/passport": "^10.x",
  "passport": "^0.7.x",
  "passport-jwt": "^4.x",
  "passport-local": "^1.x",
  "simple-oauth2": "^5.x",
  "bcrypt": "^5.x"
}
```

### Dev Dependencies

```json
{
  "@types/passport-jwt": "^4.x",
  "@types/passport-local": "^1.x", 
  "@types/bcrypt": "^5.x"
}
```

---

## References

1. [NestJS OAuth2.0 Tutorial Series](https://dev.to/tugascript/series/21297)
2. [NestJS Authentication Documentation](https://docs.nestjs.com/security/authentication)
3. [simple-oauth2 GitHub](https://github.com/lelylan/simple-oauth2)
4. [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
5. [JWT Best Practices](https://auth0.com/blog/jwt-security-best-practices/)
