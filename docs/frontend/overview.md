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
│   ├── auth/                  # Authentication
│   │   ├── components/        # Login form, register form, social buttons
│   │   ├── hooks/            # use-login.ts, use-register.ts
│   │   ├── pages/            # Login page, register page
│   │   ├── services/        # auth.api.ts — login/register/refresh calls
│   │   └── types/           # Auth DTO types
│   │
│   ├── dashboard/            # Dashboard page
│   │   └── pages/
│   │
│   ├── flashcard/            # Flashcard management
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── home/
│   │
│   ├── learning/            # Learning module (core feature)
│   │   ├── components/      # Flashcard view, quiz view, rating buttons
│   │   ├── hooks/           # use-start-session, use-due-cards, use-review-card
│   │   ├── pages/           # my-learning, study-session, dictionary-search
│   │   ├── services/        # API calls for learning/study/dictionary
│   │   ├── stores/          # Zustand stores (search store, study session)
│   │   └── types/
│   │
│   ├── shell/               # App shell (layouts, navigation, header)
│   │   ├── components/      # AppHeader, AppSidebar, ProtectedRoute
│   │   ├── pages/           # AuthenticatedLayout, UnauthenticatedLayout
│   │   └── ui/              # NavGroup, NavUser
│   │
│   ├── topic/               # Topic management
│   │   ├── components/      # CreateTopicDialog, TopicCard
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   │
│   └── workspace/           # Workspace creation wizard
│       ├── components/       # Wizard steps, workspace basics/preferences
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── stores/
│       └── types/
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

Each feature module follows a consistent structure:

```
module/
├── components/      # Dumb UI components (receive data as props)
├── hooks/          # TanStack Query hooks + custom hooks
├── pages/          # Route page components (orchestrate hooks + components)
├── services/      # API call functions (api.*.ts)
├── stores/         # Zustand stores (for module-level state)
└── types/          # Module-specific types and DTOs
```

**Key principle:** Pages are thin — they orchestrate hooks and components. Business logic lives in hooks. API calls live in services.

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
