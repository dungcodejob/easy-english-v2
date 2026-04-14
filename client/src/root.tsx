import { Outlet, createRootRoute } from '@tanstack/react-router';
import * as React from 'react';

import { useTheme } from 'next-themes';
import { Providers } from './shared/contexts/index.tsx';
import { Toaster } from './shared/ui/shadcn/sonner';
import { HotkeysProvider } from '@features/hotkeys';
import { ConfirmDialog } from './shared/ui/common/confirm-dialog/confirm-dialog';
import { useConfirmStore } from './shared/ui/common/confirm-dialog/use-confirm-dialog';
// import { Providers } from './providers/providers';

export const ToasterProvider = () => {
  const { resolvedTheme } = useTheme();
  const toastTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  return <Toaster position="top-center" theme={toastTheme} richColors />;
};

function GlobalConfirmDialog() {
  const { open, options, handleConfirm, handleCancel } = useConfirmStore();
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(v) => !v && handleCancel()}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      {...options}
    />
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Providers>
        <HotkeysProvider>
          <ToasterProvider />
          <GlobalConfirmDialog />
          <Outlet />
        </HotkeysProvider>
        {/* <TanStackRouterDevtools position="bottom-left" /> */}
      </Providers>
    </React.Fragment>
  );
}
