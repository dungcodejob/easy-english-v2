# React Module Structure: features/screens/hooks/models/services

**Extracted:** 2026-04-27
**Context:** Client module convention for easy-english-v2 (client/src/modules/)

## Problem
Old modules used `components/hooks/pages/services/types` which conflates
screen-local dumb components with reusable components, and mixes mutation hooks
with data-fetching hooks. Hard to know where a new file belongs.

## Solution
New modules follow a `features/screens/hooks/models/services` structure:

```
module/
├── features/                       # One folder per user action
│   └── <action>/                   # e.g. create-or-update-topic/, delete-topic/
│       ├── <action>.form.tsx        # Form component (if applicable)
│       ├── <action>-dialog.tsx      # Dialog/drawer shell
│       └── use-<action>.ts          # Mutation hook for this action only
│
├── screens/                        # Route-target components
│   └── <screen>/                   # e.g. topics/, topic-detail/
│       ├── <screen>.screen.tsx      # Page component — thin orchestrator
│       └── <item>-card.tsx          # Dumb components used only in this screen
│
├── hooks/                          # Shared TanStack Query hooks (cross-screen)
│   └── use-<entity>.ts
│
├── models/                         # Zod schemas and form types
│   └── <entity>-form.schema.ts
│
└── services/                       # API call functions only — no state, no hooks
    └── <entity>.api.ts
```

## Rules
- `features/<name>/` — self-contained. Not imported by other features.
- `screens/<name>.screen.tsx` — thin. Calls hooks, composes components. No business logic.
- `hooks/` — data hooks shared by 2+ screens or features within the module.
- `models/` — Zod schemas and form types. Not API response types.
- `services/` — pure API functions only.
- If a component is shared between screens within the same module → `components/` at module root.

## Reference Implementation
`client/src/modules/topic/` and `client/src/modules/dictionary/`

## Legacy Convention (do not use for new modules)
Older modules (`auth`, `learning`, `workspace`, `flashcard`) still use
`components/hooks/pages/services/types`. Follow their existing pattern when editing;
use new convention when creating new modules.

## When to Use
Any time creating a new module under `client/src/modules/` in easy-english-v2.
