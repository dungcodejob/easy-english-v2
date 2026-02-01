import { QueryProvider } from './query-context';
import { ThemeProvider } from './theme-provider';

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
};
