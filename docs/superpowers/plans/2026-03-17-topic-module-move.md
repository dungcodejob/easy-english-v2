# Topic Module Move Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the topic module from `client/src/modules/learning/topic/` to `client/src/modules/topic/`

**Architecture:** Simple file move with import path updates in routeTree.gen.ts

**Tech Stack:** React, TanStack Router

---

## Overview

This is a low-complexity refactoring task:
- Move `topic` directory from `learning` module to top-level modules
- Update routeTree.gen.ts to point to new paths

**Files to move:**
- `client/src/modules/learning/topic/hooks/use-topic-detail.ts`
- `client/src/modules/learning/topic/hooks/use-topic-mutations.ts`
- `client/src/modules/learning/topic/hooks/use-topic-words.ts`
- `client/src/modules/learning/topic/hooks/use-topics.ts`
- `client/src/modules/learning/topic/services/topic.api.ts`

---

## Chunk 1: Move Topic Directory

### Task 1: Move topic directory to top-level modules

**Files:**
- Move: `client/src/modules/learning/topic/` → `client/src/modules/topic/`

- [ ] **Step 1: Move topic directory**

Run: `mv client/src/modules/learning/topic client/src/modules/topic`

- [ ] **Step 2: Verify directory was moved**

Run: `ls -la client/src/modules/topic/`
Expected: Shows `hooks/` and `services/` directories

- [ ] **Step 3: Verify old directory is gone**

Run: `ls -la client/src/modules/learning/`
Expected: No `topic` directory listed

- [ ] **Step 4: Commit**

```bash
git add client/src/modules/learning/ client/src/modules/topic/
git commit -m "refactor: move topic module out of learning"
```

---

## Chunk 2: Update Route Tree Imports

### Task 2: Update routeTree.gen.ts imports

**Files:**
- Modify: `client/src/routeTree.gen.ts:23,26`

- [ ] **Step 1: Read current routeTree.gen.ts imports**

Run: `head -30 client/src/routeTree.gen.ts`
Expected: Shows imports from `./modules/learning/topic/...`

- [ ] **Step 2: Update imports**

Edit `client/src/routeTree.gen.ts`:
- Change line 23: `./modules/learning/topic/pages/topics.page` → `./modules/topic/pages/topics.page`
- Change line 26: `./modules/learning/topic/pages/topic-detail.page` → `./modules/topic/pages/topic-detail.page`

- [ ] **Step 3: Run route generation to verify**

Run: `cd client && npm run routes:generate`
Expected: Completes without errors

- [ ] **Step 4: Commit**

```bash
git add client/src/routeTree.gen.ts
git commit -m "refactor: update route imports for moved topic module"
```

---

## Verification

After completing all tasks:

- [ ] Run `npm run build` in client to verify no import errors
- [ ] Verify dev server starts without errors: `cd client && npm run dev`

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-17-topic-module-move.md`. Ready to execute?**
