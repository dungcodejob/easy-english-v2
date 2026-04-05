# Folder Structure

> Complete project structure reference for Easy English V2.

---

## Root

```
easy-english-v2/
├── server/             # NestJS backend (API)
├── client/             # React frontend (SPA)
├── design-system/     # Shared UI component library (future)
├── docs/              # Documentation (this project)
├── specs/             # Feature specifications
├── .claude/           # Claude Code agent memory
├── .github/            # GitHub workflows, PR templates
├── .gitnexus/         # GitNexus code intelligence index
├── .worktrees/         # Git worktrees for isolated work
├── AGENTS.md           # Agent instructions
├── CLAUDE.md           # Claude Code project context
├── GEMINI.md           # Gemini CLI project context
├── package.json       # Workspace root (pnpm)
└── pnpm-workspace.yaml # Workspace configuration
```

---

## Server (`server/`)

```
server/
├── src/
│   ├── configs/               # Environment config schemas
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── http.config.ts
│   │   └── index.ts
│   │
│   ├── core/                  # Cross-cutting infrastructure
│   │   ├── api/              # API response envelope, filters
│   │   │   ├── dto/
│   │   │   ├── exception.filter.ts
│   │   │   ├── filter/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── migrations/            # Database migrations
│   │
│   ├── modules/               # DDD bounded contexts
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   ├── repositories/
│   │   │   │   ├── events/
│   │   │   │   └── exceptions/
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   └── queries/
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   ├── orm-entities/
│   │   │   │   ├── guards/
│   │   │   │   └── services/
│   │   │   ├── presentation/
│   │   │   │   ├── dto/
│   │   │   │   ├── controllers/
│   │   │   │   └── auth.module.ts
│   │   │   └── auth.ts        # Module barrel export
│   │   │
│   │   ├── workspace/
│   │   ├── flashcard/
│   │   ├── dictionary/
│   │   └── learning/
│   │       ├── progress/       # Sub-domain
│   │       ├── study/          # Sub-domain
│   │       └── topic/          # Sub-domain
│   │
│   └── shared/                # Shared utilities
│       ├── decorators/
│       ├── filters/
│       ├── interceptors/
│       ├── middlewares/
│       ├── utils/
│       └── index.ts
│
├── test/                      # Test utilities
│   ├── test-setup.ts
│   └── app.controller.spec.ts
│
├── .env.example
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── nest-cli.json
```

---

## Client (`client/`)

```
client/
├── src/
│   ├── core/                  # App bootstrap
│   │   └── api/              # API client
│   │       ├── api.client.ts   # Axios + interceptors
│   │       ├── api.model.ts    # Response types, ApiRequestError
│   │       ├── api.call.ts
│   │       └── bare-api.ts
│   │
│   ├── features/              # Cross-cutting features
│   │   └── hotkeys/          # Keyboard shortcuts system
│   │       ├── hotkeys-provider.tsx
│   │       ├── scope-stack.ts
│   │       ├── use-hotkey.ts
│   │       └── use-hotkey-scope.ts
│   │
│   ├── modules/               # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/     # auth.api.ts
│   │   │   └── types/
│   │   ├── workspace/
│   │   ├── flashcard/
│   │   ├── learning/
│   │   ├── topic/
│   │   ├── shell/           # App layout, navigation
│   │   └── dashboard/
│   │
│   ├── shared/                # Cross-cutting shared code
│   │   ├── constants/
│   │   │   ├── routes.ts     # Route constant definitions
│   │   │   └── api-endpoints.ts
│   │   ├── contexts/
│   │   │   ├── query-client.ts
│   │   │   └── theme-context.tsx
│   │   ├── hooks/
│   │   ├── stores/
│   │   │   └── auth-store.ts  # Zustand auth store
│   │   ├── types/
│   │   └── ui/
│   │       ├── base/          # DsButton, DsCard, DsInput...
│   │       ├── common/
│   │       ├── design-tokens/ # Colors, typography, spacing
│   │       ├── patterns/      # PageLayout, FormWrapper
│   │       └── shadcn/       # Radix-based components
│   │
│   ├── locales/
│   │   ├── en/translation.json
│   │   └── vi/translation.json
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── i18n.ts               # i18next configuration
│   ├── index.tsx             # Entry point
│   ├── root.tsx               # Router root
│   └── routes.ts             # Route definitions
│
├── public/
├── .env.example
├── components.json            # shadcn/ui config
├── package.json
├── rsbuild.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Module Internals

Each feature module follows this pattern:

```
module/
├── components/         # Pure UI components (dumb)
│   └── *.tsx
├── hooks/            # Business logic + TanStack Query
│   └── *.ts
├── pages/             # Route pages (thin orchestrators)
│   └── *.tsx
├── services/         # API calls (api.*.ts)
│   └── *.ts
├── stores/           # Zustand stores (ephemeral UI state)
│   └── *.ts
└── types/            # Module-specific types and DTOs
    └── *.ts
```

---

## Shared UI Structure

```
shared/ui/
├── base/               # Project base components (Ds prefix)
│   ├── ds-button.tsx
│   ├── ds-card.tsx
│   ├── ds-input.tsx
│   ├── ds-select.tsx
│   ├── ds-badge.tsx
│   ├── ds-progress.tsx
│   ├── ds-empty-state.tsx
│   ├── ds-stat-card.tsx
│   └── index.ts
│
├── common/             # Shared common components
│   └── command-key-box.tsx
│
├── design-tokens/      # Design token constants
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   └── index.ts
│
├── patterns/           # Reusable layout patterns
│   ├── page-layout.tsx
│   ├── form-wrapper.tsx
│   ├── modal-wrapper.tsx
│   ├── wizard-layout.tsx
│   └── index.ts
│
└── shadcn/             # Radix UI + Tailwind components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── sheet.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    └── ... (30+ components)
```

---

## Docs Structure

```
docs/
├── architecture/      # 5 files — system architecture
├── api/               # 4 files — endpoint documentation
├── domain/            # 4 modules — domain model reference
├── frontend/          # 5 files — client architecture
├── features/          # 5 templates — feature development
├── adr/               # 5 files — architecture decisions
└── dev/               # 5 files — developer workflow
```
