# Frontend Overview

> Architecture, folder structure, and key patterns for the Easy English V2 React client.

---

## 1. Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | React | 19.x | UI framework |
| Bundler | Rsbuild | 1.x | Fast build tool (drop-in replacement for Webpack/Vite) |
| Language | TypeScript | 5.x | Type safety |
| Routing | TanStack Router | 1.x | File-based, type-safe routing |
| Data Fetching | TanStack Query | 5.x | Server state management |
| Client State | Zustand | 4.x | Lightweight global state |
| Forms | React Hook Form + Zod | — | Form handling and validation |
| UI Primitives | Radix UI | — | Accessible component primitives |
| UI Components | Shadcn UI | — | Component library built on Radix |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Animations | Motion | — | Declarative animations |
| i18n | i18next | — | Internationalization |

---

## 2. Folder Structure

```
client/src/
│
├── core/                        # Application bootstrap & global configuration
│   ├── api/
│   │   ├── api.client.ts        # Axios instance with interceptors
│   │   ├── api.model.ts         # ApiResponse, ApiRequestError types
│   │   └── bare-api.ts          # Base API configuration
│   ├── api.call.ts              # Typed API call utilities
│   └── api.client.ts            # Main API client
│
├── features/                    # Cross-cutting features
│   └── hotkeys/                 # Global keyboard shortcuts
│       ├── hotkeys-provider.tsx  # Context provider for hotkey registration
│       ├── scope-stack.ts        # Scoped hotkey stack management
│       ├── use-hotkey.ts         # Hook to register a hotkey
│       └── use-hotkey-scope.ts  # Hook to manage hotkey scopes
│
├── modules/                    # Feature modules (DDD-aligned with server)
│   │
│   ├── auth/                  # Authentication — features/screens/models/services
│   │   ├── features/          # login/ (form + hook), register/ (form + hook + password-input)
│   │   ├── screens/           # login/ (screen + social buttons), register/
│   │   ├── models/            # login-form.schema.ts, register-form.schema.ts
│   │   └── services/          # auth.api.ts, auth.types.ts
│   │
│   └── <module>/              # [new convention] — follow this for all new modules
│       ├── features/          # One folder per user interaction (create, delete, edit…)
│       │   └── <feature>/     # e.g. create-or-update-topic/
│       │       ├── <feature>.form.tsx         # Form component (if applicable)
│       │       ├── <feature>-dialog.tsx       # Dialog or drawer shell
│       │       └── use-<action>.ts            # Mutation hook for this action
│       │
│       ├── screens/           # Route-target components + screen-local UI
│       │   └── <screen>/      # e.g. topics/, topic-detail/
│       │       ├── <screen>.screen.tsx        # Page component (thin orchestrator)
│       │       └── <item>-card.tsx            # Dumb component used only here
│       │
│       ├── hooks/             # Shared data hooks (TanStack Query) used across screens
│       │   └── use-<entity>.ts
│       │
│       ├── models/            # Zod schemas and form types specific to this module
│       │   └── <entity>-form.schema.ts
│       │
│       └── services/          # API call functions only — no hooks, no state
│           └── <entity>.api.ts
│
├── shared/                    # Cross-cutting shared code
│   ├── constants/           # Routes, API endpoints, defaults
│   ├── contexts/            # React contexts (query client, theme)
│   ├── hooks/               # use-filters, use-local-storage, use-mobile
│   ├── stores/              # Auth store (Zustand)
│   ├── types/               # Shared type utilities
│   └── ui/                 # Shared UI components
│       ├── base/            # Design system base components
│       ├── common/          # Shared common components
│       ├── design-tokens/   # Colors, typography, spacing, radius
│       ├── patterns/        # Page layouts, form wrappers, modal wrappers
│       └── shadcn/          # Radix-based shadcn components
│
├── locales/                  # i18n translation files
│   ├── en/translation.json
│   └── vi/translation.json
│
├── styles/                  # Global CSS
│   └── globals.css
│
├── i18n.ts                  # i18next configuration
├── index.tsx               # React entry point
├── root.tsx                # TanStack Router root component
└── routes.ts               # Route definitions
```

---

## 3. Routing Structure

Routes are defined in `client/src/routes.ts` using TanStack Router's file-based routing:

```typescript
// Public routes (unauthenticated layout)
rootRoute
  └── layout('(unauthenticated)')
        ├── /login
        └── /register

// Protected routes (authenticated layout)
rootRoute
  └── layout('(authenticated)')
        ├── /                       → Dashboard
        ├── /learning               → My Learning page
        ├── /learning/study         → Study session
        ├── /learning/topics        → Topics list
        ├── /learning/topics/:id   → Topic detail
        ├── /flashcards             → Flashcards list
        ├── /study                  → Flashcard study
        ├── /flashcards/stats        → Study statistics
        ├── /workspace/new          → New workspace wizard
        └── /dictionary             → Dictionary search
              └── /dictionary/senses/:senseId → Word detail
```

---

## 4. Module Convention

New modules follow a `features/screens/hooks/models/services` structure. Older modules still use the legacy `components/hooks/pages/services/types` layout and are being migrated incrementally.

### New Convention (reference: `topic`, `dictionary`)

```
module/
├── features/                       # Self-contained user interactions
│   └── <feature-name>/             # e.g. create-or-update-topic/, delete-topic/
│       ├── <feature>.form.tsx       # Form component (if applicable)
│       ├── <feature>-dialog.tsx     # Dialog shell
│       ├── use-<action>.ts          # Mutation/action hook specific to this feature
│       └── ...                     # Other UI components + hooks for this interaction
│
├── screens/                        # Route-target components + their screen-local UI
│   └── <screen-name>/              # e.g. topics/, topic-detail/
│       ├── <screen-name>.screen.tsx # Page component (thin orchestrator)
│       └── <item>-card-item.tsx    # Dumb components used only in this screen
│
├── hooks/                          # Shared data hooks used across multiple screens
│   └── use-<entity>.ts             # e.g. use-topics.ts, use-topic-detail.ts
│
├── models/                         # Zod schemas, form models, module-scoped DTOs
│   └── <entity>-form.schema.ts
│
└── services/                       # API call functions, mappers, related services
    └── <entity>.api.ts             # e.g. topic.api.ts
```

**Rules:**
- `features/<name>/` — contains only the UI and hooks for one user action (create, delete, edit). Not shared across screens.
- `screens/<name>/<name>.screen.tsx` — the route target component. Thin: it calls hooks and composes components. No business logic.
- `screens/<name>/` can include dumb components (e.g. `topic-card-item.tsx`) that are specific to that screen.
- `hooks/` — data hooks (TanStack Query) that are shared by multiple screens or features within the module.
- `models/` — Zod schemas and form types. Not API response types (those live in `shared/` or the service file).
- `services/` — API call functions only. No hooks, no state.
- If a component or hook is shared between screens within the module, place it in `components/` or `hooks/` at the module root.

### Legacy Convention (being migrated)

Older modules (`learning`, `workspace`, `flashcard`, `settings`) still use:

```
module/
├── components/      # Dumb UI components
├── hooks/          # TanStack Query hooks + custom hooks
├── pages/          # Route page components
├── services/      # API call functions
├── stores/         # Zustand stores (module-level state)
└── types/          # Module-specific types and DTOs
```

When working in a legacy module, follow its existing convention. When creating a new module, use the new convention.

---

## 5. Design System

The `shared/ui/` directory contains the design system:

| Layer | Description |
|-------|-------------|
| `shadcn/` | Radix UI primitives wrapped with Tailwind — buttons, dialogs, sheets, etc. |
| `base/` | Project-specific base components — `ds-button`, `ds-card`, `ds-input` |
| `design-tokens/` | Color, typography, spacing, radius tokens |
| `patterns/` | Reusable layout patterns — `PageLayout`, `FormWrapper`, `WizardLayout` |

---

## 6. Related Documentation

- [State Management](./state-management.md) — Zustand stores and TanStack Query patterns
- [Routing](./routing.md) — Route structure and TanStack Router patterns
- [API Layer](./api-layer.md) — API client, error handling, request/response models
- [UI Components](./ui-components.md) — Component library and design tokens
