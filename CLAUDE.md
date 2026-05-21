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
└── docs/             # Architecture, domain, API, and developer docs
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
- `flashcard` - User flashcards and spaced repetition reviews
- `learning` - Learning progress, topics, and study sessions (nested: progress, topic, study)

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
- **UI Components**: Radix UI + shadcn UI
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Animations**: Motion
- **i18n**: i18next with browser language detection

**Project Structure**:
- `client/src/core/` - API client, routing configuration
- `client/src/modules/` - Feature modules (auth, workspace, shell, learning, flashcard, dashboard, etc.)
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

## MCP Tools

Available MCP servers and when to use each one.

| When you need to... | Use this MCP |
|---|---|
| Look up docs for any library or framework (React, NestJS, TanStack, Tailwind, MikroORM, Zod…) | `context7` — `mcp__context7__resolve-library-id` then `mcp__context7__query-docs` |
| Browse or add shadcn UI components | `shadcn` — `mcp__shadcn__search_items_in_registries`, `mcp__shadcn__get_add_command_for_items` |
| Read/write/search files at scale (multi-file reads, directory trees) | `filesystem` — `mcp__filesystem__read_multiple_files`, `mcp__filesystem__directory_tree` |
| Generate UI screens or design system tokens | `stitch` — `mcp__stitch__generate_screen_from_text`, `mcp__stitch__create_design_system` |
| Scrape web content, crawl pages, extract structured data from URLs | `firecrawl` — `mcp__firecrawl__firecrawl_scrape`, `mcp__firecrawl__firecrawl_search` |
| Search the web for current information | `exa` — `mcp__exa__web_search_exa`, `mcp__exa__web_fetch_exa` |
| Run browser automation or E2E spot-checks | `playwright` — `mcp__plugin_everything-claude-code_playwright__browser_*` |
| Get TypeScript type errors and LSP diagnostics | `ide` — `mcp__ide__getDiagnostics` |
| Manage GitHub issues or pull requests | `github` — `mcp__github__create_issue`, `mcp__github__create_pull_request` |
| Persist knowledge across sessions (entities, relations) | `memory` — `mcp__memory__create_entities`, `mcp__memory__search_nodes` |

## Documentation Map

When you need context on a topic, read the doc listed below rather than guessing from code alone.

### Architecture & Design

| Topic | Doc |
|---|---|
| System architecture overview | `docs/architecture/architecture-overview.md` |
| CQRS command/query patterns | `docs/architecture/cqrs-guidelines.md` |
| DDD module structure conventions | `docs/architecture/module-structure.md` |
| Multi-tenant isolation strategy | `docs/architecture/multi-tenant-design.md` |
| Infrastructure & deployment | `docs/architecture/system-design.md` |
| Why we made key tech decisions | `docs/adr/` (ADR-001 through ADR-005) |

### Domain Models

| Topic | Doc |
|---|---|
| Auth domain (users, sessions, tenants) | `docs/domain/auth/README.md` |
| Dictionary domain (words, senses) | `docs/domain/dictionary/README.md` |
| Flashcard domain | `docs/domain/flashcard/README.md` |
| Learning domain (progress, study, topics) | `docs/domain/learning/README.md` |
| Workspace domain | `docs/domain/workspace/README.md` |

### API Reference

| Topic | Doc |
|---|---|
| Authentication endpoints | `docs/api/authentication.md` |
| Flashcard endpoints | `docs/api/flashcard.md` |
| Study session endpoints | `docs/api/study.md` |
| Workspace endpoints | `docs/api/workspace.md` |

### Frontend

| Topic | Doc |
|---|---|
| Frontend architecture overview | `docs/frontend/overview.md` |
| Routing (TanStack Router) | `docs/frontend/routing.md` |
| State management (Zustand + React Query) | `docs/frontend/state-management.md` |
| API client layer (axios + interceptors) | `docs/frontend/api-layer.md` |

### Developer Guides

| Topic | Doc |
|---|---|
| Project setup (NestJS server) | `docs/nestjs-setup-guide.md` |
| Project setup (React client) | `docs/frontend-setup-guide.md` |
| Coding standards | `docs/dev/coding-standards.md` |
| Git workflow & branching | `docs/dev/git-workflow.md` |
| Commit message format | `docs/dev/commit-guidelines.md` |
| Folder structure conventions | `docs/dev/folder-structure.md` |

### Features & Planning

| Topic | Doc |
|---|---|
| Active feature specs | `docs/superpowers/specs/` |
| Active implementation plans | `docs/superpowers/plans/` |
| Feature descriptions | `docs/features/feature-descriptions.md` |
