# Setup Guide

> Local development environment setup for Easy English V2.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 24.x | LTS recommended |
| pnpm | ≥ 10.x | Package manager |
| PostgreSQL | ≥ 17.x | Database |
| Git | ≥ 2.x | Version control |

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd easy-english-v2
pnpm install
```

---

## 2. Environment Variables

### Server

Create `server/.env` from the example:

```bash
cd server
cp .env.example .env
```

Required variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/easy_english

# JWT
JWT_ACCESS_TOKEN_SECRET=<generate-secure-random>
JWT_REFRESH_TOKEN_SECRET=<generate-secure-random>
JWT_ACCESS_TOKEN_EXPIRED=900       # 15 minutes
JWT_REFRESH_TOKEN_EXPIRED=604800  # 7 days

# App
APP_PORT=3000
APP_CLIENT_DOMAIN=http://localhost:4200
APP_SCHEME=http
NODE_ENV=dev

# CORS
CORS_ORIGINS=http://localhost:4200

# Cookie
COOKIE_REFRESH_NAME=refresh_token
COOKIE_SECRET=<generate-secure-random>

# Throttler
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Client

Create `client/.env`:

```bash
cd client
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 3. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE easy_english;
\q

# Run initial migration
cd server
pnpm run migration:up
```

To reset the database during development:

```bash
# Drop all tables and recreate from migrations
pnpm run migration:fresh
```

---

## 4. Run Development Servers

### Start both server and client

```bash
# Terminal 1 — Server
cd server
pnpm run start:dev
# API runs at http://localhost:3000

# Terminal 2 — Client
cd client
pnpm run dev
# Frontend runs at http://localhost:4200
```

### Or use workspace-level commands (from repo root)

```bash
pnpm --filter @easy-english/server start:dev
pnpm --filter @easy-english/client dev
```

---

## 5. Verify Setup

```bash
# Server health
curl http://localhost:3000/api/v1/health

# Swagger docs
open http://localhost:3000/api/docs

# Client
open http://localhost:4200
```

---

## 6. Common Issues

### Port already in use

```bash
# Find and kill process on port 3000 or 4200
lsof -ti:3000 | xargs kill -9
lsof -ti:4200 | xargs kill -9
```

### Database connection refused

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `server/.env`
- Ensure the database exists: `psql -U postgres -c "\l"`

### pnpm install fails

```bash
# Clear pnpm cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 7. Related Documentation

- [Coding Standards](./coding-standards.md) — Code conventions
- [Git Workflow](./git-workflow.md) — Branch and PR workflow
- [Folder Structure](./folder-structure.md) — Project layout
