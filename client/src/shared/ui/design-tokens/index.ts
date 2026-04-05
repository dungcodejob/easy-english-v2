/**
 * Design Tokens — barrel export
 *
 * All design token constants live here. Import from this index:
 *   import { spacing, color, typography, radius } from '@/shared/ui/design-tokens'
 *
 * Philosophy:
 * - These are JS constants that mirror CSS vars.
 * - Use in style={{}} props or inline styles ONLY.
 * - For Tailwind className usage, use the semantic CSS vars directly
 *   (e.g. className="text-primary" not className="color: var(--primary)")
 */

export { spacing, spacingPx, type SpacingKey } from './spacing';
export { color, chartColors } from './colors';
export { typography } from './typography';
export { radius, type RadiusKey } from './radius';
