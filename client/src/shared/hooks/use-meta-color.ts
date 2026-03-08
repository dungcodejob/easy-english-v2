import * as React from 'react';
import { theme, useTheme } from '../contexts';
import { metaThemeColor } from '../types';

export function useMetaColor() {
  const { resolvedTheme } = useTheme();

  const metaColor = React.useMemo(() => {
    return resolvedTheme !== theme.dark
      ? metaThemeColor.light
      : metaThemeColor.dark;
  }, [resolvedTheme]);

  const setMetaColor = React.useCallback((color: string) => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', color);
  }, []);

  return {
    metaColor,
    setMetaColor,
  };
}
