/**
 * Color Design Tokens
 *
 * IMPORTANT: These are SEMANTIC tokens, not raw palette values.
 * - Semantic tokens (--color-action-primary) describe USE, not appearance.
 * - Raw palette tokens are the oklch values in globals.css (--primary, --destructive, etc.).
 * - Theme switching swaps the raw values behind the semantic names automatically.
 *
 * Usage in TypeScript (token constants):
 *   import { color } from '@/shared/ui/design-tokens'
 *   borderColor: color.border.default
 *
 * Usage in CSS/Tailwind (already in globals.css):
 *   className="text-primary"  ← semantic, theme-aware
 *
 * NEVER use raw oklch values in code. Always reference the CSS var.
 */

export const color = {
  /** Primary interactive surfaces */
  primary: {
    default: 'var(--primary)',
    foreground: 'var(--primary-foreground)',
    hover: 'var(--primary) / 90%',   // oklch supports opacity via /
    muted: 'var(--primary) / 10%',
    subtle: 'var(--primary) / 5%',
  },
  /** Secondary / subdued interactive surfaces */
  secondary: {
    default: 'var(--secondary)',
    foreground: 'var(--secondary-foreground)',
    hover: 'var(--secondary) / 80%',
    muted: 'var(--secondary) / 50%',
  },
  /** Destructive / error actions */
  destructive: {
    default: 'var(--destructive)',
    muted: 'var(--destructive) / 10%',
    subtle: 'var(--destructive) / 5%',
  },
  /** Accent — subtle highlight, not primary action */
  accent: {
    default: 'var(--accent)',
    foreground: 'var(--accent-foreground)',
    muted: 'var(--accent) / 50%',
  },
  /** Muted — de-emphasized content */
  muted: {
    default: 'var(--muted)',
    foreground: 'var(--muted-foreground)',
  },
  /** Card surfaces */
  card: {
    background: 'var(--card)',
    foreground: 'var(--card-foreground)',
  },
  /** Overlay / popover surfaces */
  overlay: {
    background: 'var(--popover)',
    foreground: 'var(--popover-foreground)',
  },
  /** Page / root background */
  background: {
    default: 'var(--background)',
    subtle: 'var(--background) / 50%',
  },
  /** Borders */
  border: {
    default: 'var(--border)',
    muted: 'var(--border) / 50%',
  },
  /** Focus rings */
  ring: {
    default: 'var(--ring)',
    muted: 'var(--ring) / 30%',
  },
  /** Input fields */
  input: {
    default: 'var(--input)',
    muted: 'var(--input) / 30%',
  },
  /** Tertiary / Amber — progress, streaks, highlights */
  tertiary: {
    default: 'var(--tertiary)',
    foreground: 'var(--tertiary-foreground)',
    container: 'var(--tertiary-container)',
    fixed: 'var(--tertiary-fixed)',
    'fixed-dim': 'var(--tertiary-fixed-dim)',
    muted: 'var(--tertiary) / 10%',
  },
  /** Surface hierarchy (MD3) */
  surface: {
    default: 'var(--surface)',
    bright: 'var(--surface-bright)',
    dim: 'var(--surface-dim)',
    'container-lowest': 'var(--surface-container-lowest)',
    'container-low': 'var(--surface-container-low)',
    container: 'var(--surface-container)',
    'container-high': 'var(--surface-container-high)',
    'container-highest': 'var(--surface-container-highest)',
  },
  /** On-surface text variants */
  onSurface: {
    default: 'var(--on-surface)',
    variant: 'var(--on-surface-variant)',
  },
  /** Border / outline */
  outline: {
    default: 'var(--outline)',
    variant: 'var(--outline-variant)',
  },
  /** Inverse colors (for dark-on-light) */
  inverse: {
    surface: 'var(--inverse-surface)',
    'on-surface': 'var(--inverse-on-surface)',
    primary: 'var(--inverse-primary)',
  },
  /** Error */
  error: {
    default: 'var(--error)',
    container: 'var(--error-container)',
    foreground: 'var(--on-error)',
    'on-container': 'var(--on-error-container)',
  },
} as const;

/**
 * Chart colors — only used in data visualization contexts.
 * Kept separate from semantic color tokens.
 */
export const chartColors = {
  1: 'var(--chart-1)',
  2: 'var(--chart-2)',
  3: 'var(--chart-3)',
  4: 'var(--chart-4)',
  5: 'var(--chart-5)',
} as const;
