/**
 * Spacing Design Tokens
 * Single source of truth for all spacing values.
 * Usage: import { spacing } from '@/shared/ui/design-tokens'
 *
 * Philosophy: Match Tailwind's default scale so className usage stays natural,
 * but always import constants in code — never write raw px values.
 */

export const spacing = {
  /** 0.25rem (4px) */
  px1: '0.25rem',
  /** 0.5rem (8px) */
  px2: '0.5rem',
  /** 0.75rem (12px) */
  px3: '0.75rem',
  /** 1rem (16px) */
  px4: '1rem',
  /** 1.25rem (20px) */
  px5: '1.25rem',
  /** 1.5rem (24px) */
  px6: '1.5rem',
  /** 2rem (32px) */
  px8: '2rem',
  /** 2.5rem (40px) */
  px10: '2.5rem',
  /** 3rem (48px) */
  px12: '3rem',
  /** 4rem (64px) */
  px16: '4rem',
  /** 6rem (96px) */
  px24: '6rem',
} as const;

/** Pixel equivalents for JS calculations (border widths, etc.) */
export const spacingPx = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  24: 96,
} as const;

export type SpacingKey = keyof typeof spacing;
