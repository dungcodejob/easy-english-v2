import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeProvidersProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
