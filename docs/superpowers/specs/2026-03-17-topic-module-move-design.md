# Design: Move Topic Module Out of Learning

**Date:** 2026-03-17
**Status:** Approved

## Overview

Move the `topic` module from within the `learning` module to a top-level module in the client application.

## Scope

- **Client-side only** — Backend (BE) remains unchanged
- **Source**: `client/src/modules/learning/topic/`
- **Destination**: `client/src/modules/topic/`

## Files to Move

```
client/src/modules/learning/topic/
├── hooks/
│   ├── use-topic-detail.ts
│   ├── use-topic-mutations.ts
│   ├── use-topic-words.ts
│   └── use-topics.ts
└── services/
    └── topic.api.ts
```

## Updates Required

### 1. File System Changes
- Move entire `topic` directory from `client/src/modules/learning/` to `client/src/modules/`

### 2. Route Tree Updates (`routeTree.gen.ts`)
Update imports from:
- `./modules/learning/topic/pages/topics.page` → `./modules/topic/pages/topics.page`
- `./modules/learning/topic/pages/topic-detail.page` → `./modules/topic/pages/topic-detail.page`

## Rationale

- Improves module organization by elevating `topic` to a first-class module
- Follows the same pattern as the backend where `topic` is a separate module under `learning`
- Clean separation between learning progress features and topic management

## Complexity

**Low** — Primarily a file move operation with import path updates in one generated file.
