import { StudySessionHeader } from './study-session-header';

interface StudySessionLayoutProps {
  children: React.ReactNode;
  workspaceName?: string;
  sessionType?: string;
  streak?: number;
  timer?: string;
  current?: number;
  total?: number;
  progressPercent?: number;
  onExit?: () => void;
}

export function StudySessionLayout({
  children,
  ...headerProps
}: StudySessionLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <StudySessionHeader {...headerProps} />
      <main className="max-w-4xl mx-auto px-6 py-12">{children}</main>
      {/* Watermark */}
      <div className="fixed bottom-4 right-8 text-[120px] font-headline font-black text-surface-container-highest/30 select-none pointer-events-none leading-none">
        Scholar
      </div>
    </div>
  );
}
