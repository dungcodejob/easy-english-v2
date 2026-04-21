import * as React from 'react';

import { Theme, useAppearanceStore } from '../stores';
import { metaThemeColor } from '../types';

export function useMetaColor() {
  const { resolvedTheme } = useAppearanceStore();

  const metaColor = React.useMemo(() => {
    return resolvedTheme !== Theme.Dark
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
