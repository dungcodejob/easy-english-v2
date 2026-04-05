import { TooltipProvider } from '../ui/shadcn/tooltip';
import { QueryProvider } from './query-context';
import { theme, ThemeProvider, useTheme, type Theme } from './theme-context';

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { QueryProvider, theme, ThemeProvider, useTheme, type Theme };
