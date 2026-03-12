# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Easy English V2 is a multi-tenant English learning platform with a NestJS backend and React frontend. The project uses domain-driven design (DDD) with CQRS pattern on the server side.

## Project Structure

```
easy-english-v2/
├── server/           # NestJS backend (API)
├── client/           # React frontend (SPA)
├── design-system/    # Shared UI components
└── docs/           # Setup guides and documentation
```

## Commands

### Server (NestJS)

```bash
cd server

# Development
npm run start:dev          # Start with watch mode
npm run start:debug        # Start with debugging

# Building & Running
npm run build              # Build for production
npm run start:prod         # Run built application

# Testing
npm run test               # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run with coverage
npm run test:e2e           # Run e2e tests

# Code Quality
npm run lint               # Lint and fix
npm run format             # Format with Prettier

# Database Migrations
npm run migration:create  # Create new migration
npm run migration:up      # Run pending migrations
npm run migration:down    # Revert last migration
npm run migration:fresh   # Drop and recreate all tables
```

### Client (React)

```bash
cd client

# Development
npm run dev               # Start dev server on port 4200

# Building & Running
npm run build             # Build for production
npm run preview           # Preview production build

# Code Quality
npm run lint              # Lint code
npm run format            # Format with Prettier
```

## Architecture

### Server (NestJS)

**Framework**: NestJS with TypeScript, using MikroORM with PostgreSQL

**Key Patterns**:
- **CQRS**: Commands and queries are separated using `@nestjs/cqrs`
- **DDD**: Domain entities, value objects, repositories, and domain services
- **Event-driven**: Uses `EventEmitterModule` for domain events

**Modules**:
- `auth` - Authentication, sessions, JWT tokens
- `workspace` - Multi-tenant workspace management
- `dictionary` - Word/dictionary management
- `learning` - Learning progress and topics (nested: progress, topic)

**Database**:
- PostgreSQL with MikroORM ORM
- Migrations stored in `server/src/migrations`
- Entities use the `orm-entity.ts` suffix convention

**API**:
- RESTful endpoints with Swagger documentation
- Global exception filter with standardized error responses
- Pagination, filtering, and sorting built into the API core

### Client (React)

**Framework**: React 19 with TypeScript, bundled with Rsbuild

**Key Libraries**:
- **Routing**: TanStack Router (`@tanstack/react-router`)
- **Data Fetching**: TanStack Query (`@tanstack/react-query`)
- **UI Components**: Radix UI + Base UI (`@base-ui/react`)
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Animations**: Motion
- **i18n**: i18next with browser language detection

**Project Structure**:
- `client/src/core/` - API client, routing configuration
- `client/src/modules/` - Feature modules (auth, workspace, shell, learning)
- `client/src/shared/` - Shared components, hooks, utilities, stores

## Environment Variables

Both server and client require `.env` files. Check the configs directory for required variables:

- Server: `server/src/configs/*.config.ts` for configuration schemas
- Client: `client/src/env.d.ts` for environment type definitions

## Key Conventions

- Server uses `Result<T, E>` from `neverthrow` for functional error handling
- Domain events are emitted and handled via `@nestjs/event-emitter`
- Entities follow the `*.entity.ts` pattern, ORM entities use `*.orm-entity.ts`
- Client uses TanStack Router with route tree generation (`routeTree.gen.ts`)
- UI components are built on Radix UI primitives with Tailwind styling
