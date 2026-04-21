import { useMetaColor } from '@/shared/hooks';
import {
  Theme,
  useAppearanceActions,
  useAppearanceState,
} from '@/shared/stores';
import { metaThemeColor } from '@/shared/types';
import { Button } from '@/shared/ui/shadcn/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import * as React from 'react';

export function ModeSwitcher() {
  const { setTheme } = useAppearanceActions();
  const { resolvedTheme } = useAppearanceState();
  const { setMetaColor } = useMetaColor();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === Theme.Dark ? Theme.Light : Theme.Dark);
    setMetaColor(
      resolvedTheme === Theme.Dark ? metaThemeColor.light : metaThemeColor.dark,
    );
  }, [resolvedTheme, setTheme, setMetaColor]);

  return (
    <Button
      variant="ghost"
      className="group/toggle h-8 w-8 px-0"
      onClick={toggleTheme}
    >
      <SunIcon className="hidden [html.dark_&]:block" />
      <MoonIcon className="hidden [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
