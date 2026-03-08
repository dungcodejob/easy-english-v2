import { createContext, useContext, useEffect, useState } from 'react';
import type { ObjectValues } from '../utils';

// eslint-disable-next-line react-refresh/only-export-components
export const theme = {
  dark: 'dark',
  light: 'light',
  system: 'system',
} as const;

export type Theme = ObjectValues<typeof theme>;

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  resolvedTheme: theme.system,
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [localTheme, setLocalTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (localTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? theme.dark
        : theme.light;

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(localTheme);
  }, [localTheme]);

  const value: ThemeProviderState = {
    resolvedTheme: localTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setLocalTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
