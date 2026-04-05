/**
 * Border Radius Design Tokens
 * Single source of truth for all corner radii.
 *
 * Values are expressed in rem to stay relative to root font-size.
 * Reference CSS vars defined in globals.css (--radius-*) for Tailwind compatibility.
 *
 * Usage:
 *   import { radius } from '@/shared/ui/design-tokens'
 *   borderRadius: radius.md
 */

export const radius = {
  /** 0.375rem — small inputs, badges */
  sm: 'calc(var(--radius) * 0.6)',
  /** 0.5rem — inputs, buttons (default) */
  md: 'calc(var(--radius) * 0.8)',
  /** 0.625rem — cards, modals (base) */
  lg: 'var(--radius)',
  /** 0.875rem — large panels */
  xl: 'calc(var(--radius) * 1.4)',
  /** 1.125rem — page sections */
  '2xl': 'calc(var(--radius) * 1.8)',
  /** 1.375rem — hero cards */
  '3xl': 'calc(var(--radius) * 2.2)',
  /** 1.625rem */
  '4xl': 'calc(var(--radius) * 2.6)',
  /** 9999px — pill / fully rounded */
  full: '9999px',
} as const;

export type RadiusKey = keyof typeof radius;
