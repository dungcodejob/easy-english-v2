import { QueryProvider } from './query-context';
import { theme, ThemeProvider, useTheme, type Theme } from './theme-context';

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { QueryProvider, theme, ThemeProvider, useTheme, type Theme };
