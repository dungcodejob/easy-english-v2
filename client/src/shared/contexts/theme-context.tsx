import { useAppearanceStore } from '@/shared/stores/appearance.store';
import { useEffect } from 'react';

export function ThemeSync({ children }: { children?: React.ReactNode }) {
  const theme = useAppearanceStore((s) => s.resolvedTheme);
  const textScale = useAppearanceStore((s) => s.textScale);
  const useBrowserFont = useAppearanceStore((s) => s.useBrowserFont);

  useEffect(() => {
    const root = document.documentElement;
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (useBrowserFont) {
      // Let browser fully control font-size; remove any override
      root.style.fontSize = '';
    } else {
      // Absolute px: slider 1–100 → 12px–20px, default 50 ≈ 16px
      // Immune to browser font-size preference
      const px = 12 + (textScale / 100) * 8;
      root.style.fontSize = `${px}px`;
    }
  }, [textScale, useBrowserFont]);

  return <>{children ?? null}</>;
}

export { ThemeSync as ThemeProvider };
