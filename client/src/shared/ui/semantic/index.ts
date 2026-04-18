/**
 * Semantic Button Layer
 *
 * Role-named button components. Each encapsulates a fixed visual hierarchy
 * position — variant/size are NOT exposed. Pick the component by intent,
 * not by looks.
 *
 * Rule: feature modules import ONLY from here (or other DS entrypoints).
 *       Never reach into `@/shared/ui/shadcn/button` directly.
 */

export { CTAButton } from './cta-button';
export { BackButton } from './back-button';
export { InlineEditButton } from './inline-edit-button';
export { SegmentedControlItem } from './segmented-control-item';
