# Tailwind v4 Custom Color Token Registration

**Extracted:** 2026-04-27
**Context:** Adding project-specific color tokens to a Tailwind CSS v4 project (easy-english-v2)

## Problem
Tailwind v4 has no `tailwind.config.js`. Arbitrary values like `bg-[#1a2333]` work but
are not reusable as named tokens and don't support dark-mode overrides cleanly.
Devs unfamiliar with v4 will reach for `tailwind.config.js` and find it doesn't exist.

## Solution
1. Declare the raw CSS variable in `:root` (and override in `.dark` if needed):
   ```css
   :root {
     --navy-surface: #1a2333;
     --navy-surface-dim: #121824;
     --navy-outline: #2e3b52;
   }
   ```
2. Register it in the `@theme inline` block so Tailwind generates utilities:
   ```css
   @theme inline {
     --color-navy-surface: var(--navy-surface);
     --color-navy-surface-dim: var(--navy-surface-dim);
     --color-navy-outline: var(--navy-outline);
   }
   ```
3. Now use as any Tailwind color: `bg-navy-surface`, `text-navy-surface`,
   `border-navy-outline`, `shadow-navy-surface/20`, `dark:bg-navy-surface`, etc.

## Example
File: `client/src/styles/globals.css`

```css
:root {
  /* existing tokens... */
  --navy-surface: #1a2333;
  --navy-surface-dim: #121824;
  --navy-outline: #2e3b52;
}

@theme inline {
  /* existing tokens... */
  --color-navy-surface: var(--navy-surface);
  --color-navy-surface-dim: var(--navy-surface-dim);
  --color-navy-outline: var(--navy-outline);
}
```

Usage in components:
```tsx
<div className="bg-primary dark:from-navy-surface dark:to-navy-surface-dim dark:border dark:border-navy-outline">
```

## When to Use
- Any time you find `bg-[#hex]` or `text-[#hex]` arbitrary values used more than once
- When adding dark-mode color variants that need named token references
- When a designer hands over hex values that should become system tokens
