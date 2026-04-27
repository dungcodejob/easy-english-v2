interface SocialAuthButtonsProps {
  onProviderClick?: (provider: 'google' | 'facebook' | 'github') => void;
  className?: string;
}

function ProviderButton({
  label,
  iconUrl,
  onClick,
}: {
  label: string;
  iconUrl: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:outline-none focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 has-[>svg]:px-3 grow dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
    >
      <img src={iconUrl} alt={`${label} icon`} className="size-5" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

export function SocialAuthButtons({
  onProviderClick,
  className,
}: SocialAuthButtonsProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <ProviderButton
        label="Continue with Google"
        iconUrl="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png"
        onClick={() => onProviderClick?.('google')}
      />
      <ProviderButton
        label="Continue with Facebook"
        iconUrl="https://cdn.shadcnstudio.com/ss-assets/brand-logo/facebook-icon.png"
        onClick={() => onProviderClick?.('facebook')}
      />
      <ProviderButton
        label="Continue with GitHub"
        iconUrl="https://cdn.shadcnstudio.com/ss-assets/brand-logo/github-icon.png"
        onClick={() => onProviderClick?.('github')}
      />
    </div>
  );
}
