import { TooltipProvider } from '../ui/shadcn/tooltip';
import { QueryProvider } from './query-context';
import { ThemeProvider, ThemeSync } from './theme-context';

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryProvider>
      <ThemeSync />
      <TooltipProvider>{children}</TooltipProvider>
    </QueryProvider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { QueryProvider, ThemeProvider };
