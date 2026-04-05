/**
 * Component Props Utilities
 *
 * Standard prop mixins used across DS base components.
 * Ensures consistent API surface (className, disabled, etc.)
 */

import type { HTMLAttributes } from 'react';

/**
 * Extend this type on every DS base component to guarantee:
 * - className override support
 * - Consistent disabled handling
 * - data-* slot attributes
 */
export type ComponentProps<
  T extends HTMLAttributes<HTMLElement> = HTMLAttributes<HTMLElement>,
> = T & {
  /** Additional CSS classes — always merged last via cn() */
  className?: string;
  /** Disabled state — propagated to data-[disabled] */
  disabled?: boolean;
};

/**
 * Polymorphic "as" prop type for styled primitives that can render as
 * different HTML elements (e.g. a Card that renders as <article> or <section>).
 *
 * Usage:
 *   type CardProps = PolymorphicProps<'div', ComponentProps>;
 *   function Card({ as, className, ...props }: CardProps) { ... }
 */
export type PolymorphicProps<
  DefaultElement extends string = 'div',
  ExtraProps extends object = object,
> = {
  /** Override the rendered HTML element */
  as?: DefaultElement;
} & ExtraProps;
