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
  none: '0',
  sm: '0.5rem',    // 8px — --radius-sm
  md: '0.75rem',   // 12px — --radius-md
  DEFAULT: '1rem', // 16px — --radius (was 0.625rem)
  lg: '1.5rem',    // 24px — --radius-lg
  xl: '2.5rem',    // 40px — --radius-xl
  '2xl': '3rem',   // 48px — --radius-2xl
  '3xl': '4rem',    // 64px — --radius-3xl
  '4xl': '5rem',    // 80px — --radius-4xl
  full: '9999px',  // pills
} as const;

export type RadiusKey = keyof typeof radius;
