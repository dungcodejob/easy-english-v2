/**
 * FormWrapper — reusable authentication / onboarding form layout
 *
 * Responsibilities:
 * - Center the form on screen with an atmospheric background
 * - Render a header (title + subtitle) with brand personality
 * - Wrap form content in a styled container
 * - Support optional footer links
 *
 * This is NOT a <form> element — it does NOT handle submission.
 * Wrap your form elements inside this component.
 *
 * Usage:
 *   <FormWrapper
 *     title="Create your account"
 *     subtitle="Fill in the form below to get started"
 *     headerTop={<Logo />}
 *     title="Log in to your account"
 *     footer={<Link to="/login">Already have an account?</Link>}
 *   >
 *     <MyForm />
 *   </FormWrapper>
 */

import type { ReactNode } from 'react';

interface FormWrapperProps {
  /** Primary heading text */
  title: string;
  /** Secondary descriptive text below the title */
  subtitle?: string;
  /** Any React nodes to render below subtitle (badges, alerts, etc.) */
  headerExtra?: ReactNode;
  /** React nodes rendered above the title (e.g. logo, social buttons, brand mark) */
  headerTop?: ReactNode;
  /** The form or content to render inside the card */
  children: ReactNode;
  /** Optional footer content below the form (links, legal text, etc.) */
  footer?: ReactNode;
  /** Extra className on the outer wrapper */
  className?: string;
  /** Card size variant */
  cardSize?: 'sm' | 'default' | 'lg';
}

/**
 * Decorative side panel — renders the visual half of the split layout.
 * Extracted here so it can be swapped for a hero image, testimonial, etc.
 */
function AuthSidePanel() {
  return (
    <div className="hidden lg:flex lg:flex-1 lg:flex-col">
      {/* Atmospheric warm gradient — matches the commented-out aesthetic in unauthenticated-layout */}
      <div
        className="relative flex flex-1 flex-col"
        style={{
          background:
            'linear-gradient(160deg, #7C3AED 0%, #A855F7 25%, #C084FC 50%, #DDD6FE 75%, #EDE9FE 100%)',
        }}
      >
        {/* Decorative grain overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
          }}
        />
        {/* Floating decorative shapes */}
        <div className="absolute right-8 top-20 size-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-32 left-16 size-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-1/3 top-1/3 size-32 rounded-full bg-yellow-300/10 blur-2xl" />
        {/* Brand text at bottom */}
        <div className="relative z-10 mt-auto p-10">
          <p className="text-2xl font-bold text-white/90">
            Master English with confidence
          </p>
          <p className="mt-2 text-sm text-white/60">
            Join thousands of learners building fluency every day.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Card shell — renders the form card in the split layout */
function FormCard({
  children,
  footer,
  cardSize = 'default',
}: Pick<FormWrapperProps, 'children' | 'footer' | 'cardSize'>) {
  const cardWidthClass =
    cardSize === 'sm'
      ? 'max-w-sm'
      : cardSize === 'lg'
        ? 'max-w-lg'
        : 'max-w-md';

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 lg:p-8">
      <div className={`w-full ${cardWidthClass}`}>
        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
          {children}
        </div>
        {footer && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Minimal centered variant — no split layout, just a card */
function CenteredCard({
  children,
  footer,
  cardSize = 'default',
}: Pick<FormWrapperProps, 'children' | 'footer' | 'cardSize'>) {
  const cardWidthClass =
    cardSize === 'sm'
      ? 'max-w-sm'
      : cardSize === 'lg'
        ? 'max-w-lg'
        : 'max-w-md';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className={`w-full ${cardWidthClass}`}>
        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
          {children}
        </div>
        {footer && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function FormWrapper({
  title,
  subtitle,
  headerExtra,
  headerTop,
  children,
  footer,
  className = '',
  cardSize = 'default',
  variant = 'split',
}: FormWrapperProps & { variant?: 'split' | 'centered' }) {
  const cardContent = (
    <>
      {headerTop && <div className="mb-6">{headerTop}</div>}
      <div className="mb-6 flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
        {headerExtra}
      </div>
      {children}
    </>
  );

  if (variant === 'centered') {
    return (
      <div className={className}>
        <CenteredCard footer={footer} cardSize={cardSize}>
          {cardContent}
        </CenteredCard>
      </div>
    );
  }

  return (
    <div
      className={`grid min-h-screen lg:grid-cols-[minmax(0,1fr),minmax(0,520px)] xl:grid-cols-[minmax(0,1fr),minmax(0,560px)] ${className}`}
    >
      <FormCard footer={footer} cardSize={cardSize}>
        {cardContent}
      </FormCard>
      <AuthSidePanel />
    </div>
  );
}
