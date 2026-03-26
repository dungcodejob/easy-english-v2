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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **easy-english-v2** (5090 symbols, 10966 relationships, 230 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/easy-english-v2/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/easy-english-v2/context` | Codebase overview, check index freshness |
| `gitnexus://repo/easy-english-v2/clusters` | All functional areas |
| `gitnexus://repo/easy-english-v2/processes` | All execution flows |
| `gitnexus://repo/easy-english-v2/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
