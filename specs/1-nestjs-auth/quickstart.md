# Quickstart: NestJS Authentication System

**Feature**: 1-nestjs-auth  
**Date**: 2026-01-19

This guide provides step-by-step instructions to get the authentication system running locally.

---

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database running
- NestJS server setup completed (from previous task)

---

## Step 1: Install Dependencies

```bash
cd server

# Core auth dependencies
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local simple-oauth2 bcrypt

# Type definitions
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt
```

---

## Step 2: Configure Environment Variables

Add the following to your `.env.dev` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# OAuth2 Providers (optional - enable as needed)
OAUTH_GOOGLE_ENABLED=true
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

OAUTH_GITHUB_ENABLED=true
OAUTH_GITHUB_CLIENT_ID=your-github-client-id
OAUTH_GITHUB_CLIENT_SECRET=your-github-client-secret

OAUTH_FACEBOOK_ENABLED=false
OAUTH_FACEBOOK_CLIENT_ID=
OAUTH_FACEBOOK_CLIENT_SECRET=

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000

# Cookie settings
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
```

---

## Step 3: Create Database Migration

Generate the migration file:

```bash
npm run migration:create -- --name CreateAuthTables
```

Copy the SQL from `data-model.md` migrations into the generated file.

Run the migration:

```bash
npm run migration:up
```

---

## Step 4: Create the Auth Module

Create the module structure:

```bash
# Create directories
mkdir -p src/modules/auth/controllers
mkdir -p src/modules/auth/application/commands
mkdir -p src/modules/auth/application/queries
mkdir -p src/modules/auth/domain/entities
mkdir -p src/modules/auth/domain/value-objects
mkdir -p src/modules/auth/domain/enums
mkdir -p src/modules/auth/domain/repositories
mkdir -p src/modules/auth/infrastructure/persistence
mkdir -p src/modules/auth/infrastructure/repositories
mkdir -p src/modules/auth/infrastructure/oauth/providers
mkdir -p src/modules/auth/guards
mkdir -p src/modules/auth/strategies
mkdir -p src/modules/auth/decorators
mkdir -p src/modules/auth/dto/requests
mkdir -p src/modules/auth/dto/responses
```

---

## Step 5: Register Auth Module

Update `src/app.module.ts`:

```typescript
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // ... existing imports
    AuthModule,
  ],
})
export class AppModule {}
```

---

## Step 6: Verify Setup

1. Start the server:
   ```bash
   npm run start:dev
   ```

2. Check Swagger documentation at `http://localhost:3001/api`

3. Test registration:
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name": "John Doe", "email": "john@example.com", "password": "SecurePass1!"}'
   ```

4. Test login:
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier": "john@example.com", "password": "SecurePass1!"}'
   ```

---

## OAuth Provider Setup (Optional)

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3001/api/v1/auth/oauth/google/callback`
4. Copy Client ID and Secret to `.env.dev`

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3001/api/v1/auth/oauth/github/callback`
4. Copy Client ID and Secret to `.env.dev`

### Facebook

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app with Facebook Login
3. Add Valid OAuth Redirect URI: `http://localhost:3001/api/v1/auth/oauth/facebook/callback`
4. Copy App ID and Secret to `.env.dev`

---

## Common Issues

### Issue: JWT verification fails

**Solution**: Ensure `JWT_SECRET` is the same across all server instances.

### Issue: Cookie not set

**Solution**: Check CORS configuration includes `credentials: true` and frontend sends `withCredentials: true`.

### Issue: OAuth redirect fails

**Solution**: Verify the callback URL in provider console matches exactly with your server URL.

---

## Next Steps

After the auth module is implemented:

1. Run `/speckit.tasks` to generate implementation tasks
2. Follow the task list to implement each component
3. Run tests to verify functionality
4. Connect frontend to auth endpoints
