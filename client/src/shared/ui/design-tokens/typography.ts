/**
 * Typography Design Tokens
 * Single source of truth for all typographic values.
 *
 * Font families, sizes, weights, and line heights are defined here.
 * Import these constants in code — never write raw values inline.
 *
 * Usage:
 *   import { typography } from '@/shared/ui/design-tokens'
 *   style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium }}
 */

export const typography = {
  /** Font family stack — match whatever your fonts.css loads */
  fontFamily: {
    sans: 'var(--font-sans)',      // Be Vietnam Pro
    mono: 'var(--font-mono)',
    display: 'var(--font-headline)', // Lexend
    headline: 'var(--font-headline)', // Lexend — alias for .font-headline
  },

  /** Font sizes — matches Tailwind's default scale */
  size: {
    /** 0.75rem / 12px */
    xs: '0.75rem',
    /** 0.875rem / 14px */
    sm: '0.875rem',
    /** 1rem / 16px — body default */
    base: '1rem',
    /** 1.125rem / 18px */
    lg: '1.125rem',
    /** 1.25rem / 20px */
    xl: '1.25rem',
    /** 1.5rem / 24px */
    '2xl': '1.5rem',
    /** 1.875rem / 30px */
    '3xl': '1.875rem',
    /** 2.25rem / 36px */
    '4xl': '2.25rem',
    /** 3rem / 48px */
    '5xl': '3rem',
  },

  /** Font weights */
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  /** Line heights */
  leading: {
    /** 1 — tight headings */
    none: '1',
    /** 1.25 */
    tight: '1.25',
    /** 1.375 */
    snug: '1.375',
    /** 1.5 — body default */
    normal: '1.5',
    /** 1.625 */
    relaxed: '1.625',
    /** 1.75 */
    loose: '1.75',
  },

  /** Letter spacing */
  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;
