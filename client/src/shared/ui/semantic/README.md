# Semantic Button Layer

Role-named wrappers around the shadcn Button primitive. Every component in
this folder encodes a **fixed position in the visual hierarchy** — `variant`
and `size` are intentionally not exposed.

## When to use which

| Component               | Role                              | Per screen section |
| ----------------------- | --------------------------------- | ------------------ |
| `CTAButton`             | Dominant primary action           | **Max 1**          |
| `BackButton`            | Back / cancel / dismiss           | 0–1                |
| `InlineEditButton`      | Tiny inline affordance inside a card | 0–N               |
| `SegmentedControlItem`  | One segment of a segmented control | inside a group    |

## Rules

- ❌ **Never** `import { Button } from '@/shared/ui/shadcn/button'` inside a
  feature module. The shadcn primitive is reserved for wrappers in
  `base/`, `semantic/`, `patterns/`.
- ❌ **Never** add `variant` or `size` props to a semantic component.
  If you need a new role, add a new semantic component.
- ✅ Pick the component by intent (*"this is the CTA"*), not by looks
  (*"I want a rounded button"*).

## Why

A generic `<Button variant="ghost" size="sm" />` lets each screen reinvent its
own hierarchy. Users then see six different "primary" buttons across the app
and lose the ability to scan quickly for the main action. Encoding roles as
components makes the hierarchy enforceable at review time: a PR that adds a
second `<CTAButton>` in the same section is visually obvious.
