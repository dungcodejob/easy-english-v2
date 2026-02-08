import type { ReactNode } from 'react';

interface WizardStepLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function WizardStepLayout({
  title,
  description,
  children,
}: WizardStepLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="mx-auto max-w-md">{children}</div>
    </div>
  );
}
