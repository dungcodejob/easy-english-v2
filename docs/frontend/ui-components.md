# UI Components

> Design system organization, component layers, and conventions.

---

## 1. Design System Layers

The frontend UI system has three layers, from lowest to highest abstraction:

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: Radix UI Primitives (@radix-ui/*)                │
│  Raw, accessible, unstyled components                        │
│  • Dialog, Sheet, Popover, DropdownMenu, etc.              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 2: Shadcn UI (@base-ui/react + Tailwind)             │
│  Styled, accessible components with consistent design         │
│  • Button, Card, Input, Badge, Table, etc.                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 3: Project Base Components (shared/ui/base/)           │
│  Project-specific wrappers with DS prefix                     │
│  • DsButton, DsCard, DsInput, DsSelect, DsBadge          │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Shared UI Directory

```
client/src/shared/ui/
├── base/                  # Project base components (Ds prefix)
│   ├── ds-button.tsx
│   ├── ds-card.tsx
│   ├── ds-input.tsx
│   ├── ds-select.tsx
│   ├── ds-badge.tsx
│   ├── ds-progress.tsx
│   ├── ds-spinner.tsx
│   ├── ds-empty-state.tsx
│   └── ds-stat-card.tsx
│
├── common/                # Shared common components
│   └── command-key-box.tsx   # Keyboard shortcut display
│
├── design-tokens/        # Design token constants
│   ├── colors.ts         # Color palette
│   ├── typography.ts     # Font sizes, weights, line heights
│   ├── spacing.ts        # Spacing scale
│   └── radius.ts         # Border radius scale
│
├── patterns/             # Layout patterns
│   ├── page-layout.tsx   # Standard page with header slot
│   ├── form-wrapper.tsx   # Form with validation state
│   ├── modal-wrapper.tsx # Modal with consistent styling
│   └── wizard-layout.tsx # Multi-step wizard layout
│
└── shadcn/              # Shadcn UI components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── sheet.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── badge.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── select.tsx
    ├── tooltip.tsx
    ├── avatar.tsx
    ├── popover.tsx
    ├── command.tsx
    └── ... (30+ components)
```

---

## 3. Design Tokens

### Colors

```typescript
// File: client/src/shared/ui/design-tokens/colors.ts
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    900: '#0c4a6e',
  },
  // ... semantic colors mapped to CSS variables
};
```

### Typography

```typescript
// File: client/src/shared/ui/design-tokens/typography.ts
export const typography = {
  fontSizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem' },
  fontWeights: { normal: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
};
```

### Spacing

Uses Tailwind's default spacing scale. Custom values are added to `tailwind.config.js`.

### Border Radius

```typescript
// File: client/src/shared/ui/design-tokens/radius.ts
export const radius = {
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
};
```

---

## 4. Component Props Pattern

All base components follow a consistent props pattern:

```typescript
// File: client/src/shared/ui/base/ds-button.tsx
interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

// Usage
<Button variant="primary" size="md" loading={isSubmitting}>
  Submit
</Button>
```

---

## 5. Pattern: Page Layout

```typescript
// File: client/src/shared/ui/patterns/page-layout.tsx
interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;   // Top-right action buttons
  children: React.ReactNode;
}

// Usage
<PageLayout
  title="My Learning"
  description="Review your vocabulary progress"
  actions={<Button>Add Word</Button>}
>
  <LearningList />
</PageLayout>
```

---

## 6. Pattern: Form Wrapper

Standardizes form layout with consistent error display:

```typescript
// File: client/src/shared/ui/patterns/form-wrapper.tsx
interface FormWrapperProps {
  onSubmit: React.FormEventHandler;
  children: React.ReactNode;
}

// Automatically wires React Hook Form context
// Shows field-level errors under each input
// Shows form-level error banner when present
```

---

## 7. Hotkey System

Global keyboard shortcuts are managed via a provider-based system:

```typescript
// File: client/src/features/hotkeys/

// HotkeysProvider wraps the app — registers keyboard listener
// Each route/screen can define its own hotkey scope

// Register a hotkey
function StudyPage() {
  useHotkey({
    key: 'Space',
    scope: 'study',
    handler: () => showAnswer(),
  });

  return <StudySession />;
}

// Scope management — only active scope's hotkeys fire
function DictionarySearch() {
  useHotkeyScope('dictionary'); // Set this scope as active
  useHotkey({ key: '/', handler: () => focusSearch() });
  return <Dictionary />;
}
```

---

## 8. Related Documentation

- [Overview](./overview.md) — Folder structure and module conventions
- [State Management](./state-management.md) — Client state patterns
